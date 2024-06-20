// ChoreItem.test.tsx
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import {screen} from '@testing-library/dom'
import ChoreItem from '@/app/ChoreItem';
import { ConsistencyProvider, ConsistencyContext } from '@/app/ConsistencyContext';
import { AnimationProvider } from '@/app/AnimationContext';


const mockChore = {
  id: 1,
  name: 'Test Chore'
};


const renderChoreItem = (props = {}, mockConsistencyContextValues = defaultMockConsistencyContextValues) => {
  return render(
    <ConsistencyProvider>
      <AnimationProvider>
        <ConsistencyContext.Provider value={mockConsistencyContextValues}>
          <ChoreItem
            chore={mockChore}
            onClick={jest.fn()}
            completed="_"
            x={0}
            y={0}
            {...props}
          />
        </ConsistencyContext.Provider>
      </AnimationProvider>
    </ConsistencyProvider>
  );
};


const defaultMockConsistencyContextValues = {
  fullXColumns: [],
  horizontalOTriplets: [],
  horizontalXTriplets: [],
  verticalXTriplets: [],
  totalPoints: 0,
  loading: true,
  fetchConsistencyData: jest.fn()
};


describe('ChoreItem Component', () => {
//  test('renders without crashing', () => {
//    const { getByText } = renderChoreItem();
//    expect(getByText('Loading...')).toBeInTheDocument();
//  });
//
//  test('displays the correct initial icon', () => {
//    const mockValues = {
//      ...defaultMockConsistencyContextValues,
//      loading: false,
//    };
//
//    const { getByAltText } = renderChoreItem({}, mockValues);
//
//    expect(getByAltText('chore icon')).toHaveAttribute('src', 'static/images/empty.png');
//  });


  test('updates the icon when completed is changed', async () => {
    const mockValues = {
      ...defaultMockConsistencyContextValues,
      loading: false,
    };

    const { rerender } = renderChoreItem({ completed: 'O' }, mockValues);

    rerender(
      <ConsistencyProvider>
        <AnimationProvider>
          <ConsistencyContext.Provider value={mockValues}>
            <ChoreItem
              chore={mockChore}
              onClick={jest.fn()}
              completed="X"
              x={0}
              y={0}
            />
          </ConsistencyContext.Provider>
        </AnimationProvider>
      </ConsistencyProvider>
    );

    await waitFor(() => {
      expect(screen.getByAltText('chore icon')).toHaveAttribute('src', 'static/images/miss_day.png');
    });
  });

//  test('plays animation and updates icon on special condition', async () => {
//    const { getByAltText, rerender } = renderChoreItem();
//    rerender(
//      <ConsistencyProvider>
//        <AnimationProvider>
//          <ChoreItem
//            chore={mockChore}
//            onClick={jest.fn()}
//            completed="X"
//            x={0}
//            y={0}
//          />
//        </AnimationProvider>
//      </ConsistencyProvider>
//    );
//    await waitFor(() => {
//      expect(getByAltText('chore icon')).toHaveAttribute('src', 'static/images/star_alonka.png');
//    });
//  });
//
//  test('calls onClick when clicked', () => {
//    const handleClick = jest.fn();
//    const { getByAltText } = renderChoreItem({ onClick: handleClick });
//
//    fireEvent.click(getByAltText('chore icon'));
//    expect(handleClick).toHaveBeenCalledTimes(1);
//  });
});
