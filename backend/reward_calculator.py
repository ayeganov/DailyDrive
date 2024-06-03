from models import ChoreTable, WeekScores


WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


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
        if all(table[r][c] == 'X' for r in range(rows)):
            scores.full_X_columns.append(c)

    return scores
