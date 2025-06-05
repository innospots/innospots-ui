
const width = '100%'
const height = '100%'

const Video = ({ src }) => {
  return (
    <video width={width} height={height} controls>
      <source src={ src } type="video/mp4"/>
      <source src={ src } type="video/ogg"/>
      <source src={ src } type="video/webm"/>
      <object data={ src } width={width} height={height}>
        <embed src={ src } width={width} height={height} />
      </object>
    </video>
  )
}

export default Video