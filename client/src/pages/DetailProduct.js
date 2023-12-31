import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import convertRupiah from "rupiah-format";
import { useQuery, useMutation } from "react-query";

import Navbar from "../components/Navbar";

import { API } from "../config/api";

export default function DetailProduct() {
  let navigate = useNavigate();
  let { id } = useParams();

  let { data: product } = useQuery("productDetailCache", async () => {
    const response = await API.get("/product/" + id);
    return response.data.data;
  });

  // code here
  useEffect(() => {
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const myMidtransClientKey = process.env.REACT_APP_MIDTRANS_CLIENT_KEY;

    let scriptTag = document.createElement("script");
    scriptTag.src = midtransScriptUrl;
    scriptTag.setAttribute("data-client-key", myMidtransClientKey);

    document.body.appendChild(scriptTag);
    return () => {
      document.body.removeChild(scriptTag);
    };
  });

  const handleBuy = useMutation(async (e) => {
    try {
      e.preventDefault();

      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const data = {
        product_id: product.id,
        seller_id: product.user.id,
        price: product.price,
      };

      const body = JSON.stringify(data);

      const response = await API.post("/transaction", body, config);
      console.log("transaction success :", response);

      // code here
      const token = response.data.data.token;
      window.snap.pay(token, {
        onSuccess: function (result) {
          console.log(result);
          navigate("/profile");
        },
        onPending: function (result) {
          console.log(result);
          navigate("/profile");
        },
        onError: function (result) {
          console.log(result);
          navigate("/profile");
        },
        onClose: function () {
          alert("You closed the popup without finishing the payment!");
        },
      });
    } catch (error) {
      console.log("transaction failed : ", error);
    }
  });

  return (
    <div>
      <Navbar />
      <Container className="py-5">
        <Row>
          <Col md="2"></Col>
          <Col md="3">
            <img src={product?.image} className="img-fluid" />
          </Col>
          <Col md="5">
            <div className="text-header-product-detail">{product?.name}</div>
            <div className="text-content-product-detail">
              Stock : {product?.qty}
            </div>
            <p className="text-content-product-detail mt-4">{product?.desc}</p>
            <div className="text-price-product-detail text-end mt-4">
              {convertRupiah.convert(product?.price)}
            </div>
            <div className="d-grid gap-2 mt-5">
              <button
                onClick={(e) => handleBuy.mutate(e)}
                className="btn btn-buy"
              >
                Buy
              </button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
