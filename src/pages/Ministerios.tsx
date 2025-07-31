import MinisterioList from "../components/MinisterioList";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MinisteriosPage: React.FC = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar theme="colored" />
      <MinisterioList />
    </>
  );
};

export default MinisteriosPage;
