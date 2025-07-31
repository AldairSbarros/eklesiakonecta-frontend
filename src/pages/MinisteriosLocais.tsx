import MinisterioLocalList from "../components/MinisterioLocalList";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MinisteriosLocaisPage: React.FC = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar theme="colored" />
      <MinisterioLocalList />
    </>
  );
};

export default MinisteriosLocaisPage;
