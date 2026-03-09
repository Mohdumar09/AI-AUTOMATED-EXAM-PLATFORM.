import { Link } from 'react-router-dom';
import { ReactComponent as LogoDark } from 'src/assets/images/logos/dark-logo.svg';
import { styled, Typography } from '@mui/material';

const LinkStyled = styled(Link)(() => ({
  height: '70px',
  width: '200px',
  overflow: 'hidden',
  display: 'block',
  marginRight: '30px',
}));

const Logo = () => {
  return (
    <LinkStyled to="/">
      <LogoDark height={70} />
    </LinkStyled>
  );
};

export default Logo;
