import React from 'react'
import './example.less'
import * as viewer from '../index'
// import * as viewer from 'h5-imageviewer'
import img_cover from '../assets/cover.jpg'
import img_close from '../assets/close.png'
import img_timg from '../assets/timg.jpg'
import img_uof from '../assets/uof.jpg'
import errorPlh from '../assets/img_loading_error.png'

export default class ExampleNode extends React.Component {
  // constructor(props) {
  //   super(props)
  //   this.state = {
  //     color: 'blue',
  //   }
  // }
  state = {
    color: 'blue',
  }
  handleTapCallback = (e) => {
    const { color } = this.state || {};
    const ele = document.getElementsByClassName('testtest')[0];
    let styleArr = getComputedStyle(ele).cssText;
    console.log(getComputedStyle(ele)['color'], '单击事件！', this.state);
    if (color === 'blue') {
      ele.style.color = 'red'
      this.setState({
        color: 'red',
      })
    } else {
      ele.style.color = 'blue'
      this.setState({
        color: 'blue',
      })
    }
  }

  onShowImgsClickWithDoms = () => {
    let _this = this;
    const el = document.createElement('img')
    el.src = img_close
    el.alt = '地方'
    el.className = 'btnClose'

    const indicator = document.createElement('div')
    indicator.className = 'indicator'
    const imgs = [img_cover, img_uof, img_timg]
    const dotDoms = []
    imgs.forEach(() => {
      const dot = document.createElement('div')
      dot.className = 'dot'
      indicator.appendChild(dot)
      dotDoms.push(dot)
    })
    el.addEventListener('click', e => {
      e.stopPropagation()
      e.preventDefault()
      viewer.hideImgListViewer()  // 隐藏
    })

    const Test = document.createElement('div');
    Test.className = 'testtest'
    Test.innerText = '789789 '

    let dom = <div className="testtest">123213</div>

    viewer.showImgListViewer([{ src: img_cover }, { src: img_uof }, { src: img_timg }], {
      defaultPageIndex: 1,
      onPageChanged: pageIndex => {
        console.log(pageIndex, 'pageIndex');
      },
      restDoms: [dom],
      viewerBg: '#333333',
      clickClosable: false,
      // handleTap: this.handleTapCallback()
      handleTap: this.handleTapCallback,
    })
    setTimeout(() => {
      console.log('定时器')
      viewer.setCurrentPage(2)
    }, 2000)
  }

  render() {
    return (
      <div className='example'>
        <button className='btnShow2' data-testid='btnShowImageListWithDoms' onClick={this.onShowImgsClickWithDoms}>111</button>
      </div>
    )
  }
}
