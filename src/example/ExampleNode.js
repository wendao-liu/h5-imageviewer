import React from 'react'
import './example.less'
import * as viewer from '../index'
// import * as viewer from 'h5-imageviewer'
import img_cover from '../assets/cover.jpg'
import img_close from '../assets/close.png'
import img_timg from '../assets/timg.jpg'
import img_uof from '../assets/uof.jpg'
import errorPlh from '../assets/img_loading_error.png'
import error_plh from '@/utils/error_plh';
export default class ExampleNode extends React.Component {
  // constructor(props) {
  //   super(props)
  //   this.state = {
  //     color: 'blue',
  //   }
  // }
  state = {
    color: 'blue',
    data: [{ src: img_cover }, { src: img_uof }, { src: img_timg }]
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
    const { data } = this.state;
    console.log(data, '轮播图片')
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

    // 关闭按钮
    const closeDom = <img src={img_close} className="btnClose" onClick={
      e => {
        e.stopPropagation()
        e.preventDefault()
        viewer.hideImgListViewer()  // 隐藏
      }
    } />
    let dom = <div className="testtest" onClick={() => {
      // this.setState({
      //   data: [...data, data[0]]
      // })
      // this.onShowImgsClickWithDoms();  // 触发事件
      viewer.handleRestDoms([<div>999999</div>]) // 添加节点方法
    }}>123213</div>
    console.log(dom, closeDom, 'dom, closeDom');
    viewer.showImgListViewer(data, {
      defaultPageIndex: 1,
      onPageChanged: pageIndex => {
        console.log(pageIndex, 'pageIndex');
      },
      restDoms: [dom, closeDom],
      viewerBg: '#333333',
      clickClosable: false,
      handleTap: this.handleTapCallback,
    })
    setTimeout(() => {
      console.log('定时器')
      viewer.setCurrentPage(2)
    }, 2000)
  }


  componentDidMount() {
    setTimeout(() => {
      this.onShowImgsClickWithDoms();
    })
  }

  render() {
    return (
      <div className='example'>
        <button className='btnShow2' onClick={this.onShowImgsClickWithDoms}>111</button>
        <div className="pobi_mobile_viewer_loading"></div>
      </div>
    )
  }
}
