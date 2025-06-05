import FileView from './FileView'
import TableView from './TableView'
import ChartView from './ChartView'
import ImageView from './ImageView'
import VideoView from './VideoView'
import MarkdownView from './MarkdownView'

export const RenderViewMap = {
  slice: MarkdownView,
  markdown: MarkdownView,
  file: FileView,
  table: TableView,
  chart: ChartView,
  image: ImageView,
  video: VideoView,
}
