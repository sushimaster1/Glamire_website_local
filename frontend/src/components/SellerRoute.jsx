import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

const SellerRoute = ({ children }) => {
    const { user } = useStore();

    if (!user || user.role !== 'seller') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default SellerRoute;
