import { Outlet } from 'react-router-dom';
import Header from './components/layout/header';
import axios from './util/axios.customize'
import { useContext, useEffect } from 'react'
import { AuthContext } from './components/context/auth.context';
import { Spin } from 'antd';

function App() {
  const { setAuth, appLoading, setAppLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setAppLoading(true);
        const res = await axios.get(`/v1/api/user`);
        if (res && res.EC === 0) {
          setAuth({
            isAuthenticated: true,
            user: {
              email: res.user?.email ?? "",
              name: res.user?.name ?? ""
            }
          })
        }
      } catch (error) {
        console.error("Fetch account error:", error);
      } finally {
        setAppLoading(false);
      }
    }

    fetchAccount()
  }, [])

  return (
    <div>
      {appLoading === true ?
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}>

          <Spin />

        </div>
        :
        <>
          <Header />
          <Outlet />
        </>
      }
    </div>
  )
}

export default App
