import EndoReport from './pages/EndoReport';
import Settings from './pages/Settings';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Admin from './pages/Admin';

export const PAGES = {
    "EndoReport": EndoReport,
    "Settings": Settings,
    "Patients": Patients,
    "PatientDetail": PatientDetail,
    "Admin": Admin,
    "login": Login,
    "register": Register,
    "forgot-password": ForgotPassword,
}

export const pagesConfig = {
    mainPage: "EndoReport",
    Pages: PAGES,
};