import "./payment.scss";
import KhaltiCheckout from "khalti-checkout-web";
import { makeRequest } from "../../axios";
import { ToastContainer, toast } from "react-toastify";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import sha256 from "crypto-js/sha256";
import Base64 from "crypto-js/enc-base64";
import { HmacSHA256 } from "crypto-js";

export default function Payment() {
  const { currentUser } = useContext(AuthContext);
  const eventId = parseInt(useLocation().pathname.split("/")[2]);
  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [inputs, setInputs] = useState({
    title: "",
    amount: "",
    remarks: "",
  });

  const {
    isLoading: expenseLoading,
    error: expenseError,
    data: expenseData,
  } = useQuery(["expenses", eventId], async () => {
    const res = await makeRequest.get("/events/expenses?eventId=" + eventId);
    return res.data;
  });

  const queryClient = useQueryClient();

  const addMutation = useMutation(
    async (newExpense) => {
      return await makeRequest.post(
        "/events/expenses?eventId=" + eventId,
        newExpense
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["expenses"]);
      },
    }
  );

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    addMutation.mutate(inputs);
    setInputs({
      title: "",
      amount: "",
      remarks: "",
    });
  };

  //event data fetching
  const { isLoading, error, data } = useQuery(["events"], async () => {
    const res = await makeRequest.get("/events/" + eventId);
    return res.data;
  });

  const sum =
    Array.isArray(expenseData) &&
    expenseData.reduce((total, item) => total + item.amount, 0);

  const share =
    Array.isArray(expenseData) &&
    expenseData.reduce((total, item) => total + item.amount, 0) /
      data?.members?.length;

  const {
    isLoading: paymentLoding,
    error: paymentError,
    data: paymentData,
  } = useQuery(["payments", eventId], async () => {
    const res = await makeRequest.get("/events/payments?eventId=" + eventId);
    return res.data;
  });

  var currentTime = new Date();
  var formattedTime =
    currentTime.toISOString().slice(2, 10).replace(/-/g, "") +
    "-" +
    currentTime.getHours() +
    currentTime.getMinutes() +
    currentTime.getSeconds();

  var hash = HmacSHA256(
    `total_amount=${share},transaction_uuid=${formattedTime},product_code=EPAYTEST`,
    "8gBm/:&EnhH.1/q"
  );
  var hashInBase64 = Base64.stringify(hash);

  const hasPaid = paymentData?.some((obj) => obj.user_id === currentUser.id);

  return (
    <div className="payment">
      <form
        action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
        method="POST"
        id="esewa-pay"
      >
        <input type="text" id="amount" name="amount" value={share} />
        <input type="text" id="tax_amount" name="tax_amount" value="0" />
        <input
          type="text"
          id="total_amount"
          name="total_amount"
          value={share}
        />
        <input
          type="text"
          id="transaction_uuid"
          name="transaction_uuid"
          value={formattedTime}
        />
        <input
          type="text"
          id="product_code"
          name="product_code"
          value="EPAYTEST"
        />
        <input
          type="text"
          id="product_service_charge"
          name="product_service_charge"
          value="0"
        />
        <input
          type="text"
          id="product_delivery_charge"
          name="product_delivery_charge"
          value="0"
        />
        <input
          type="text"
          id="success_url"
          name="success_url"
          value={`http://localhost:3000/payment-success?eventId=${encodeURIComponent(
            eventId
          )}&amount=${encodeURIComponent(share)}`}
        />
        <input
          type="text"
          id="failure_url"
          name="failure_url"
          value="https://developer.esewa.com.np/failure"
        />
        <input
          type="text"
          id="signed_field_names"
          name="signed_field_names"
          value="total_amount,transaction_uuid,product_code"
        />
        <input
          type="text"
          id="signature"
          name="signature"
          value={hashInBase64}
        />
        <input value="Submit" type="submit" />
      </form>
      <div className="expenses">
        <div className="expense-details">
          <h4>
            Number of Expenses: <span>{expenseData && expenseData.length}</span>
          </h4>
          <h4>
            Total Amount: <span>{sum * data?.members?.length}</span>
          </h4>
          <h4>
            Your Share: <span>{share * data?.members?.length}</span>
          </h4>
          {hasPaid ? (
            <button disabled className="khalti-pay">
              Paid
            </button>
          ) : (
            <button type="submit" className="khalti-pay" form="esewa-pay">
              Pay Your Share
            </button>
          )}
        </div>
        <div className="table-headers">
          <h3>Expense Table</h3>
          {data && data.host === currentUser.id ? (
            openAddExpense ? (
              <button
                onClick={(e) => setOpenAddExpense(false)}
                className="close-button"
              >
                Close
              </button>
            ) : (
              <button
                onClick={(e) => setOpenAddExpense(true)}
                className="add-button"
              >
                Add
              </button>
            )
          ) : (
            <></>
          )}
        </div>
        {openAddExpense ? (
          <div className="expense-form">
            <div className="form">
              <label htmlFor="title">Expense Title: </label>
              <input
                type="text"
                name="title"
                onChange={handleChange}
                value={inputs.title}
              />
              <label htmlFor="amount">Amount: </label>
              <input
                type="number"
                name="amount"
                placeholder="Amount per head"
                onChange={handleChange}
                value={inputs.amount}
              />
              <label htmlFor="remarks">Remarks: </label>
              <input
                type="text"
                name="remarks"
                onChange={handleChange}
                value={inputs.remarks}
              />
            </div>
            <button onClick={handleAdd} className="add-button">
              Add
            </button>
          </div>
        ) : (
          <></>
        )}
        <table>
          <tr>
            <th>Expense Title</th>
            <th>Amount Per Head</th>
            <th>Remarks</th>
          </tr>
          {expenseData &&
            expenseData.map((expense) => {
              return (
                <tr key={expense.id}>
                  <td>{expense.expense_title}</td>
                  <td>{expense.amount}</td>
                  <td>{expense.remarks}</td>
                </tr>
              );
            })}
        </table>
      </div>
      <ToastContainer />
    </div>
  );
}
