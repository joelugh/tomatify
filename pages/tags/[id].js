import { useRouter } from 'next/router';

import Layout from '../../components/Layout';
import TagView from '../../components/TagsView/TagView';

const TagPage = () => {

    const router = useRouter();
    const { id } = router.query;

    return <Layout>
        <TagView id={id} />
    </Layout>

}

export default TagPage;