
const width = '100%'
const height = '100%'

const Embed = ({ src }) => {
  return (
    <object data={ src } width={width} height={height}>
      <embed src={ src } width={width} height={height} />
    </object>
  )
}

export default Embed