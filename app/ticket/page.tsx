"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ticket.module.css';

interface PurchaseItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Ticket {
  ticket_id: string;
  purchase_date: string;
  items: PurchaseItem[];
  total_amount: number;
  user_id: number;
  user_name: string;
}

export default function TicketPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Intentar obtener el ticket del almacenamiento local
    const storedTicket = localStorage.getItem('lastTicket');
    if (storedTicket) {
      try {
        setTicket(JSON.parse(storedTicket));
      } catch (e) {
        console.error('Error parsing stored ticket:', e);
      }
    }
  }, []);

  if (!ticket) {
    return (
      <div className={styles.container}>
        <h1>Ticket no encontrado</h1>
        <p>No se encontró información del ticket.</p>
        <button onClick={() => router.push('/carrito')}>
          Volver al carrito
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.ticket}>
        <h1>Ticket de Compra</h1>
        
        <div className={styles.header}>
          <p><strong>Ticket ID:</strong> {ticket.ticket_id}</p>
          <p><strong>Fecha:</strong> {new Date(ticket.purchase_date).toLocaleString()}</p>
          <p><strong>Cliente:</strong> {ticket.user_name}</p>
        </div>

        <div className={styles.items}>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ticket.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}><strong>Total</strong></td>
                <td><strong>${ticket.total_amount.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className={styles.footer}>
          <p>¡Gracias por tu compra!</p>
          <button onClick={() => window.print()} className={styles.printButton}>
            Imprimir Ticket
          </button>
          <button onClick={() => router.push('/')} className={styles.homeButton}>
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}