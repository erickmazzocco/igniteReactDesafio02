import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const newCart = [...cart];
      const productExits = newCart.find(product => product.id === productId);

      const stock = await api.get<UpdateProductAmount>(`stock/${productId}`)

      const amount = productExits ? productExits.amount + 1 : 1

      if (amount > stock.data.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (productExits) {
        productExits.amount = amount;
      } else {
        const result = await api.get<Product>(`products/${productId}`)
        const newProduct = { ...result.data, amount }
        newCart.push(newProduct);
      }
      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCart = [...cart];
      const productIndex = newCart.findIndex(product => product.id === productId);

      if (productIndex >= 0) {
        console.log(newCart)
        const cartWithoutProduct = newCart.filter(product => product.id !== productId);
        setCart(cartWithoutProduct);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartWithoutProduct));
      } else {
        throw Error();
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if(amount < 1){
        throw Error();
      }

      const newCart = [...cart];
      const product = newCart.find(product => product.id === productId)
      if (product === undefined) {
        throw Error();
      }

      const stock = await api.get<UpdateProductAmount>(`stock/${productId}`);

      if (amount > stock.data.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      product.amount = amount;
      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
