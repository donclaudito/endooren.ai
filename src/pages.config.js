import EndoReport from './pages/EndoReport';
import Settings from './pages/Settings';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';


export const PAGES = {
    "EndoReport": EndoReport,
    "Settings": Settings,
    "Patients": Patients,
    "PatientDetail": PatientDetail,
}

export const pagesConfig = {
    mainPage: "EndoReport",
    Pages: PAGES,
};