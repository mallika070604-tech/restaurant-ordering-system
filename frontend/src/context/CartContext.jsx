import { createContext, useContext, useMemo, useReducer } from 'react';
import { calcTotals } from '../utils/format';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i._id === action.item._id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i._id === action.item._id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, quantity: 1, notes: '' }],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i._id !== action.id) };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map((i) =>
          i._id === action.id ? { ...i, quantity: Math.max(1, action.quantity) } : i
        ),
      };
    case 'UPDATE_NOTES':
      return {
        ...state,
        items: state.items.map((i) =>
          i._id === action.id ? { ...i, notes: action.notes } : i
        ),
      };
    case 'CLEAR':
      return { ...state, items: [], customerNotes: '' };
    case 'SET_NOTES':
      return { ...state, customerNotes: action.notes };
    default:
      return state;
  }
};

export const CartProvider = ({ children, tableNumber }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    customerNotes: '',
    tableNumber,
  });

  const totals = useMemo(() => calcTotals(state.items), [state.items]);

  const value = useMemo(
    () => ({
      ...state,
      ...totals,
      itemCount: state.items.reduce((s, i) => s + i.quantity, 0),
      addItem: (item) => dispatch({ type: 'ADD_ITEM', item }),
      removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', id }),
      updateQty: (id, quantity) => dispatch({ type: 'UPDATE_QTY', id, quantity }),
      updateNotes: (id, notes) => dispatch({ type: 'UPDATE_NOTES', id, notes }),
      setCustomerNotes: (notes) => dispatch({ type: 'SET_NOTES', notes }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
    }),
    [state, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
