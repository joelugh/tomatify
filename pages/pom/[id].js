import { useRouter } from 'next/router';
import PomView from '../../components/PomView';
import Layout from '../../components/Layout';

const UserPage = () => {

  const router = useRouter();
  const { id } = router.query;

  return <Layout hideHeader>
    <PomView id={id} />
  </Layout>

}

export default UserPage;