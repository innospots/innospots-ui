import CustomReactMarkdown from '@/components/CustomReactMarkdown'
import { ViewProps } from './type'

const MarkdownView: React.FC<ViewProps> = ({ dataSource }) => {
  return <CustomReactMarkdown value={dataSource.data} />;
};

export default MarkdownView