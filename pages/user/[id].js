import { useRouter } from 'next/router';
import UserView from '../../components/UserView';
import Layout from '../../components/Layout';

const UserPage = () => {

  const router = useRouter();
  const { id } = router.query;

  return <Layout>
    <UserView id={id} />
  </Layout>

}

export default UserPage;