import PomDrawer from "./PomDrawer";
import BottomNav from "./BottomNav";
import Header from "./Header";

function Layout({
    hideHeader = false,
    hideNav = false,
    children,
}) {
    return <>
        {!hideHeader && <Header />}
        {!hideNav && <BottomNav />}
        <div style={{
            display:'flex',
            flexDirection: 'column',
            alignItems:'center',
            paddingTop: 40,
            paddingBottom: 50,
        }}>
            {children}
        </div>
    </>;
}

export default Layout;
