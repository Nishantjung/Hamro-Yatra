import React, { useEffect } from "react";
import "./PaymentSuccess.scss";
import { useLocation, useSearchParams } from "react-router-dom";
import { makeRequest } from "../../axios";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const rawAmount = searchParams.get("amount");
  let amount = rawAmount;
  let eventId = searchParams.get("eventId");

  if (rawAmount?.includes("?data=")) {
    const [amt, dataParam] = rawAmount.split("?data=");
    amount = amt;
  }

  useEffect(() => {
    if (eventId && amount) {
      const registerPayment = async () => {
        try {
          await makeRequest.post(`/events/payments?eventId=${eventId}`, {
            amount: amount,
          });
          console.log("Payment registered successfully");
        } catch (err) {
          console.error("Failed to register payment:", err);
        }
      };

      registerPayment();
    }
  }, [eventId, amount]);

  return (
    <div className="payment-success-body">
      <div className="card">
        <div className="checkmark-wrapper">
          <i className="checkmark">✓</i>
        </div>
        <h1 id="success-heading">Success</h1>
        <p>
          We received your payment;
          <br /> we'll be in touch shortly!
        </p>
        <a href={`/eventDetails/${eventId}`}>Go Back</a>
      </div>
    </div>
  );
};

export default PaymentSuccess;
