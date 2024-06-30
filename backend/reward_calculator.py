from typing import Iterable
from sqlalchemy.dialects.postgresql import UUID

from models import ChoreTable, WeekScores, Chore, ChoreHistory, get_current_week_start, utcnow, Reward
from chore_repository import ChoreRepository, ChoreHistoryRepository
from reward_repository import RewardRepository


WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


FULL_COLUMN_MIN_HEIGHT = 4
HORIZONTAL_TRIPLET_AWARD_MINUTES = 30
VERTICAL_TRIPLET_AWARD_MINUTES = 5
SINGLE_TRIPLET_PENALTY_MINUTES = 20
PERFECT_DAY_AWARD_MINUTES = 30
MONEY_PER_STAR_POINT = 0.2


def calculate_reward_times(scores: WeekScores) -> WeekScores:
    if scores.horizontal_X_triplets:
        # always award extra time for the first first triplet
        scores.total_minutes += HORIZONTAL_TRIPLET_AWARD_MINUTES
    scores.total_minutes += len(scores.horizontal_X_triplets) * HORIZONTAL_TRIPLET_AWARD_MINUTES

    scores.total_minutes += len(scores.vertical_X_triplets) * VERTICAL_TRIPLET_AWARD_MINUTES

    if scores.horizontal_O_triplets:
        # always penalize extra time for the first triplet
        scores.total_minutes -= SINGLE_TRIPLET_PENALTY_MINUTES
    scores.total_minutes -= len(scores.horizontal_O_triplets) * SINGLE_TRIPLET_PENALTY_MINUTES

    if scores.full_X_columns:
        scores.total_minutes += len(scores.full_X_columns) * PERFECT_DAY_AWARD_MINUTES

    scores.money_equivalent = scores.total_points * MONEY_PER_STAR_POINT
    return scores


def find_regularities_with_locations(chore_table: ChoreTable) -> WeekScores:
    table = chore_table.table
    scores = WeekScores()

    rows = len(table)
    if rows == 0:
        return scores

    cols = len(table[0])
    if cols == 0:
        return scores

    used_in_horizontal_x = set()
    used_in_horizontal_o = set()
    used_in_vertical_x = set()

    # Horizontal triplet search
    for r in range(rows):
        scores.total_points += table[r].count('X')

        for c in range(cols - 2):
            if table[r][c:c+3] == ['X', 'X', 'X'] and all((r, c+i) not in used_in_horizontal_x for i in range(3)):
                scores.horizontal_X_triplets.append([(r, c+i) for i in range(3)])
                for i in range(3):
                    used_in_horizontal_x.add((r, c+i))
            elif table[r][c:c+3] == ['O', 'O', 'O'] and all((r, c+i) not in used_in_horizontal_o for i in range(3)):
                scores.horizontal_O_triplets.append([(r, c+i) for i in range(3)])
                for i in range(3):
                    used_in_horizontal_o.add((r, c+i))

    # Vertical triplet search
    for c in range(cols):
        for r in range(rows - 2):
            if all(table[r+i][c] == 'X' for i in range(3)) and all((r+i, c) not in used_in_vertical_x for i in range(3)):
                scores.vertical_X_triplets.append([(r+i, c) for i in range(3)])
                for i in range(3):
                    used_in_vertical_x.add((r+i, c))

    # Full column search
    for c in range(cols):
        if all(table[r][c] == 'X' for r in range(rows)) and rows >= FULL_COLUMN_MIN_HEIGHT:
            scores.full_X_columns.append(c)

    return calculate_reward_times(scores)


async def archive_and_reset_user_chores(
    user_id: UUID,
    chore_repo: ChoreRepository,
    chore_history_repo: ChoreHistoryRepository,
    reward_repo: RewardRepository
) -> Iterable[Chore]:
    # Step 1: Fetch current chores for the specific user
    user_chores: Iterable[Chore] = await chore_repo.get_by_user_id(user_id)

    if not user_chores:
        return user_chores

    chore_statuses_json: list = [chore.statuses for chore in user_chores]
    chores_by_day = []
    for chore_statuses in chore_statuses_json:
        chores_as_list = [chore_statuses[day] for day in WEEKDAYS]
        chores_by_day.append(chores_as_list)

    chore_table = ChoreTable(table=chores_by_day)

    # Step 2: Create and add chore history entries
    for chore in user_chores:
        chore_history = ChoreHistory(
            chore_id=chore.id,
            user_id=chore.user_id,
            week_start_date=chore.week_start_date,
            statuses=chore.statuses,
            expired_at=utcnow(),
            reward_func=chore.reward_func
        )
        await chore_history_repo.add_entity(chore_history)

    # Step 3: Reset statuses of existing chores
    reset_statuses = {day: "_" for day in WEEKDAYS}

    for chore in user_chores:
        await chore_repo.update(chore.id, {
            "statuses": reset_statuses,
            "week_start_date": get_current_week_start()
        })

    # Step 4: Calculate rewards for the user
    reward = await reward_repo.get_single_by_user_id(user_id)
    scores = find_regularities_with_locations(chore_table)

    if reward is None:
        reward = Reward(
            user_id=user_id,
            star_points=scores.total_points,
            tv_time_points=scores.total_minutes,
            game_time_points=scores.total_minutes,
        )
        await reward_repo.add_entity(reward)
    else:
        reward.star_points += scores.total_points
        reward.tv_time_points = max(0, reward.tv_time_points + scores.total_minutes)
        reward.game_time_points = max(0, reward.game_time_points + scores.total_minutes)
        await reward_repo.update_entity(reward)

    return user_chores
