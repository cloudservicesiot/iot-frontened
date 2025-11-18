// import { useState } from "react";
// import { Routes, Route } from "react-router-dom";
// import Topbar from "./scenes/global/Topbar";
// import Sidebar from "./scenes/global/Sidebar";
// import Team from "./scenes/team";
// import Invoices from "./scenes/invoices";
// import Contacts from "./scenes/contacts";
// import Form from "./scenes/form";
// import FAQ from "./scenes/faq";
// import { CssBaseline, ThemeProvider } from "@mui/material";
// import { ColorModeContext, useMode } from "./theme";
// import EntityForm from "./scenes/form/EntityForm";
// import EntitySwitch from "./components/switchLayout/EntitySwitch";
// import FloorPlan from "./components/device/FloorPlan";
// import Automation from "./components/automation/AutomationLayout";
// import CodeEditor from "./components/codeeditor/CodeEditor";
// import WebSocketComponent from "./components/dashbord/MainLayout";
// import LoginPage from "./components/auth/LoginPage";
// import SignupPage from "./components/auth/SignupPage";

// function App() {
//   const [theme, colorMode] = useMode();
//   const [isSidebar, setIsSidebar] = useState(true);

//   return (
//     <ColorModeContext.Provider value={colorMode}>
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
       
//         <div className="app">
//           <Sidebar isSidebar={isSidebar} />
//           <main className="content">
//             <Topbar setIsSidebar={setIsSidebar} />
//             <Routes>
              
//               {/* <Route path="/" element={<EntitySwitch/>}/> */}
//               <Route path="/" element={<WebSocketComponent/>}/>
//               <Route path="/team" element={<Team />} />
//               <Route path="/contacts" element={<Contacts />} />
//               <Route path="/invoices" element={<Invoices />} />
//               <Route path="/floorplan" element={<FloorPlan/>}/>
//               <Route path="/form" element={<Form />} />
//               <Route path="/entityform" element={<EntityForm />} />
//               <Route path="/mainswitch" element={<EntitySwitch/>}/>
//               <Route path="/codeeditor" element={<CodeEditor />} />
            
//               {/* <Route path="/line" element={<Line />} /> */}
//               <Route path="/line" element={<WebSocketComponent />} />
//               <Route path="/faq" element={<FAQ />} />
//               <Route path="/user/register" element={<SignupPage/>} />
//               <Route path="/user/login" element={<LoginPage/>} />
//             </Routes>
//           </main>
//         </div>
//       </ThemeProvider>
//     </ColorModeContext.Provider>
//   );
// }
// export default App;







import { useState, useEffect } from "react";
import { Routes, Route,useLocation } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/allDevices/DeviceswithEntities";
import Form from "./scenes/form";
import FAQ from "./scenes/faq";
import { CssBaseline, ThemeProvider, useMediaQuery, useTheme } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import EntityForm from "./scenes/form/EntityForm";
import EntitySwitch from "./components/switchLayout/EntitySwitch";
import FloorPlan from "./components/device/FloorPlan";
import Automation from "./components/automation/AutomationLayout";
import CodeEditor from "./components/codeeditor/CodeEditor";
import WebSocketComponent from "./components/dashbord/MainLayout";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import { AuthProvider } from '../src/hooks/useAuth';
import PrivateRoute from '../src/components/auth/PrivateRoute';
import EnergyDashboard from "./components/energy/EnergyMeterDetail";
import EnergyMeters from "./components/energy/EnergyMeter";
import AirConditionerForm from "./components/airConditioner/AcForm";
import AllAirConditioner from "./components/airConditioner/AirConditioner";
import AcControlls from "./components/airConditioner/AcControlls";
import DevicesAndEntities from "./scenes/allDevices/DeviceswithEntities";
import Entities from "./components/entityHistoricData/Entities";
import EntityDetailsComponent from "./components/entityHistoricData/EntityDetails";
import WmsMotorsComponent from "./components/waterManagmentSystem/wmsMotors";
import WmsMotorsDetail from "./components/waterManagmentSystem/WmsMotorsDetail";
import EditDevices from "./scenes/form/EditDevices"
import EditEntities from "./scenes/form/EditEntities";
import { WebSocketProvider } from './context/useWebsocket';
import EnergyMeterReport1 from "./components/reports/EnergyMeterReport-1";
import EnergyMeterReport2 from "./components/reports/EnergyMeterReport-2";
import ACHistoryReport from "./components/reports/AcReport1";
import MotorHistoryReport from "./components/reports/WmsReport-1";

// Inner component that uses theme-dependent hooks
function AppContent() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // Sidebar hidden by default on mobile, visible on desktop
  const [isSidebar, setIsSidebar] = useState(!isMobile);

  // Update sidebar state when screen size changes
  useEffect(() => {
    setIsSidebar(!isMobile);
  }, [isMobile]);

  // Define routes without layout
  const noLayoutRoutes = ["/user/login", "/user/register"];
  const isNoLayoutRoute = noLayoutRoutes.includes(location.pathname);

  return (
    <>
      {isNoLayoutRoute ? (
        <Routes>
          <Route path="/user/login" element={<LoginPage />} />
          <Route path="/user/register" element={<SignupPage />} />
        </Routes>
      ) : (
        <PrivateRoute>
          <div className="app">
            <Sidebar isSidebar={isSidebar} setIsSidebar={setIsSidebar} />
            <main className="content">
              <Topbar setIsSidebar={setIsSidebar} />
              <Routes>
                    {/* Private Routes */}
                  <Route
                    path="/"
                    element={<WebSocketComponent />}
                  />
                  <Route
                    path="energy-meters/report-1"
                    element={<EnergyMeterReport1 />}
                  /> 
                   <Route
                    path="/energy-meters/report-2"
                    element={<EnergyMeterReport2 />}
                  />
                   <Route
                    path="/ac/report-1"
                    element={<ACHistoryReport />}
                  />
                  <Route
                    path="/wms/report-1"
                    element={<MotorHistoryReport />}
                  />
                  <Route
                    path="/faq"
                    element={<FAQ />}
                  />
                  <Route
                    path="devices"
                    element={<DevicesAndEntities/>}
                  />
                  <Route
                    path="/editdevices"
                    element={<EditDevices/>}
                  />
                  <Route
                    path="/devices/:deviceId/entities"
                    element={<EditEntities/>}
                  />
                  <Route
                    path="/team"
                    element={<Team />}
                  />
                  <Route
                    path="codeeditor"
                    element={<CodeEditor/>}
                  />
                  <Route
                    path="/3-d/floorplan"
                    element={<FloorPlan/>}
                  />
                  <Route
                    path="/form"
                    element={<Form/>}
                  />
                  <Route 
                    path="/entities"
                    element={<Entities/>}
                  />
                  <Route path="/entities/history/detail/:id" element={<EntityDetailsComponent/>}/>
                  <Route
                    path="/entityform"
                    element={<EntityForm/>}
                  />
                  <Route
                    path="/energy/meters"
                    element={<EnergyMeters/>}
                  />
                  <Route path="/energy/meters/detail/:id" element={<EnergyDashboard />} />
                  {/* Add more protected routes here */}
                  <Route
                    path="/air-conditioner/add"
                    element={<AirConditionerForm/>}
                  />
                  <Route
                    path="/ac/dashboard"
                    element={<AllAirConditioner/>}
                  />
                  <Route
                    path="/ac/dashbord/device/controll/:deviceId"
                    element={<AcControlls/>}
                  />
                  <Route 
                    path="/wms/motors"
                    element={<WmsMotorsComponent/>}
                  />
                  <Route
                    path="/wms/motors/history/detail/:id"
                    element={<WmsMotorsDetail/>}
                  />
                  {/* Catch-all route - redirect to dashboard if route not found */}
                  <Route
                    path="*"
                    element={<WebSocketComponent />}
                  />
              </Routes>
            </main>
          </div>
        </PrivateRoute>
      )}
    </>
  );
}

function App() {
  const [theme, colorMode] = useMode();

  return (
    <WebSocketProvider>
      <AuthProvider>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}> 
            <CssBaseline />
            <AppContent />
          </ThemeProvider> 
        </ColorModeContext.Provider>
      </AuthProvider>
    </WebSocketProvider>
  );
}


export default App;







