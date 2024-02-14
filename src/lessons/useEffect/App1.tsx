import { useEffect } from 'react';

type Item = {
  name: string;
  price: number;
  quantity: number;
};

const CartItem = ({ item }: { item: Item }) => {
  useEffect(() => {
    console.log(`${item.name} quantity has changed to ${item.quantity}.`);
  }, [item]);

  return (
    <>
      <h3>{item.name}</h3>
      <span>
        {item.price} x {item.quantity}
      </span>
    </>
  );
};

export const App1 = () => {
  return (
    <CartItem
      item={{
        name: 'Apples',
        price: 2.99,
        quantity: 10,
      }}
    />
  );
};
