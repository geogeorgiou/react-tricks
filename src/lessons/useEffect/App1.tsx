import { useEffect, useState } from 'react';

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
