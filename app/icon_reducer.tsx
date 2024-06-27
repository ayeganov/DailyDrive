

export interface IconState
{
  fullXColumns: number[];
  horizontalOTriplets: number[][][];
  horizontalXTriplets: number[][][];
  verticalXTriplets: number[][][];
  am_i_special: boolean;
  initialization: boolean;
  icon: string;
}


export type IconAction =
  | { type: 'SET_ICON', payload: string }
  | { type: 'SET_FULL_X_COLUMNS', payload: number[] }
  | { type: 'SET_HORIZONTAL_O_TRIPLETS', payload: number[][][] }
  | { type: 'SET_HORIZONTAL_X_TRIPLETS', payload: number[][][] }
  | { type: 'SET_VERTICAL_X_TRIPLETS', payload: number[][][] }
  | { type: 'SET_AM_I_SPECIAL', payload: boolean }
  | { type: 'SET_INITIAL', payload: boolean };



export default function icon_reducer(state: IconState, action: IconAction)
{
  switch(action.type)
  {
    case 'SET_ICON':
      return { ...state, icon: action.payload };
    case 'SET_FULL_X_COLUMNS':
      return { ...state, fullXColumns: action.payload };
    case 'SET_HORIZONTAL_O_TRIPLETS':
      return { ...state, horizontalOTriplets: action.payload };
    case 'SET_HORIZONTAL_X_TRIPLETS':
      return { ...state, horizontalXTriplets: action.payload };
    case 'SET_VERTICAL_X_TRIPLETS':
      return { ...state, verticalXTriplets: action.payload };
    case 'SET_AM_I_SPECIAL':
      return { ...state, am_i_special: action.payload };
    case 'SET_INITIAL':
      return { ...state, initialization: action.payload };

    default:
      return state;
  }
}
