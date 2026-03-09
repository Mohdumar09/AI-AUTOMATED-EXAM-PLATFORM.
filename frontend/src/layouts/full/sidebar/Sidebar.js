import { useMediaQuery, Box, Drawer, Typography } from '@mui/material';
import Logo from '../shared/logo/Logo';
import SidebarItems from './SidebarItems';
// import { Upgrade } from './Updrade';

const Sidebar = (props) => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

  const sidebarWidth = '270px';

  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
        }}
      >
        {/* ------------------------------------------- */}
        {/* Sidebar for desktop */}
        {/* ------------------------------------------- */}
        <Drawer
          anchor="left"
          open={props.isSidebarOpen}
          variant="permanent"
          PaperProps={{
            sx: {
              width: sidebarWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {/* ------------------------------------------- */}
          {/* Sidebar Box */}
          {/* ------------------------------------------- */}
          <Box
            sx={{
              height: '100%',
            }}
          >
            {/* ------------------------------------------- */}
            {/* Logo */}
            {/* ------------------------------------------- */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 3,
                py: 2,
                width: '100%',
                gap: 2, // adds spacing between logo and text
              }}
            >
              <Logo />

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.2rem',
                  color: 'primary.main',
                  // ml: 10, // ❌ remove this as it pushes it too far right
                  // mt: 1,  // ❌ remove unnecessary top margin
                  whiteSpace: 'nowrap',
                  mr: 5,
                }}
              >
                PROCTIFY
              </Typography>
            </Box>

            <Box>
              {/* ------------------------------------------- */}
              {/* Sidebar Items */}
              {/* ------------------------------------------- */}
              <SidebarItems />
              {/* <Upgrade /> */}
            </Box>
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={props.isMobileSidebarOpen}
      onClose={props.onSidebarClose}
      variant="temporary"
      PaperProps={{
        sx: {
          width: sidebarWidth,
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      {/* ------------------------------------------- */}
      {/* Logo */}
      {/* ------------------------------------------- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 2,
          width: '100%',
        }}
      >
        <Logo />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '1.2rem',
            color: 'primary.main',
            ml: 1,
          }}
        >
          AI EVAL_8
        </Typography>
      </Box>
      {/* ------------------------------------------- */}
      {/* Sidebar For Mobile */}
      {/* ------------------------------------------- */}
      <SidebarItems />
      {/* <Upgrade /> */}
    </Drawer>
  );
};

export default Sidebar;
