import { useEffect, useState } from 'react';

type Item = {
  name: string;
  price: number;
  quantity: number;
};

const CartItem = ({ item }: { item: Item }) => {
  const { name, quantity, price } = item;

  useEffect(() => {
    console.log(`${name} quantity has changed to ${quantity}.`);
  }, [name, quantity]);

  return (
    <>
      <h3>{name}</h3>
      <span>
        {price} x {quantity}
      </span>
    </>
  );
};

export const App2 = () => {
  const [item, setItem] = useState({
    name: 'Apples',
    price: 2.99,
    quantity: 10,
  });

  const handleChangeItem = () =>
    setItem({
      name: 'Apples',
      price: 2.99,
      quantity: 10,
    });

  return (
    <>
      <button onClick={handleChangeItem}>Change Item</button>
      <CartItem item={item} />
    </>
  );
};
