import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(product => ({
    ...product,
    priceFormatted: formatPrice(product.price),
    subTotal: product.price * product.amount
  }));

  const total =
    formatPrice(
      cartFormatted.reduce((sumTotal, product) => {
        return sumTotal + product.subTotal;
      }, 0)
    );

  function handleProductIncrement(product: Product) {
    updateProductAmount({
      productId: product.id, 
      amount: product.amount + 1
    });
  }

  function handleProductDecrement(product: Product) {
    updateProductAmount({
      productId: product.id, 
      amount: product.amount - 1
    });
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map(productFormatted => (
            <tr data-testid="product" key={productFormatted.id}>
              <td>
                <img src={productFormatted.image} alt={productFormatted.title} />
              </td>
              <td>
                <strong>{productFormatted.title}</strong>
                <span>{productFormatted.priceFormatted}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                    disabled={productFormatted.amount <= 1}
                    onClick={() => handleProductDecrement(productFormatted)}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={productFormatted.amount}
                  />
                  <button
                    type="button"
                    data-testid="increment-product"
                    onClick={() => handleProductIncrement(productFormatted)}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{productFormatted.subTotal}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                  onClick={() => handleRemoveProduct(productFormatted.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}

        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
