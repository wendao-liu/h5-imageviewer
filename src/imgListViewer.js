import './main.less'
import AlloyFinger from 'alloyfinger'
import imageLoaded from './utils/image_loaded'
import Transform from './utils/transform'
import To from './utils/to'
import ease from './utils/ease'
import imgAlloyFinger from './imgAlloyFinger'
import orit from './utils/orientation'
import scrollThrough from './utils/scrollThrough'
import IMG_EMPTY from './utils/altImg'

const VIEWER_CONTAINER_ID = 'pobi_mobile_viewer_container_id'
const VIEWER_PANEL_ID = 'pobi_mobile_viewer_panel_id'
const VIEWER_SINGLE_IMAGE_ID = 'pobi_mobile_viewer_single_image_id'
const VIEWER_SINGLE_IMAGE_CONTAINER = 'pobi_mobile_viewer_single_image_container'

let containerDom = null
let panelDom = null
let currPage = 0
let orientation = orit.PORTRAIT
let viewerData = null
let alloyFingerList = []
let pannelAlloyFinger = null

function noop() {}

export const showImgListViewer = (imgList=[], options) => {
  if (!Array.isArray(imgList) || imgList.length <= 0) return
  hideImgListViewer(false)
  scrollThrough(true)
  orientation = orit.phoneOrientation()
  orit.removeOrientationChangeListener(userOrientationListener)
  orit.addOrientationChangeListener(userOrientationListener)
  let wrapOptions = {}
  if(options) wrapOptions = {...options}
  const {
    defaultPageIndex = 0,
    altImg,
    onPageChanged = noop,
    onViewerHideListener = noop,
    restDoms = [],
    pageThreshold = 0.1,
    pageDampingFactor = 0.95,
    imgMoveFactor = 1.5,
    imgMinScale = 1,
    imgMaxScale = 2
  } = wrapOptions
  viewerData = { 
    imgList: [...imgList], 
    options: { defaultPageIndex, altImg, onPageChanged, onViewerHideListener, restDoms, pageThreshold, pageDampingFactor, imgMoveFactor, imgMinScale, imgMaxScale } 
  }
  if(defaultPageIndex < 0 || defaultPageIndex > imgList.length - 1) {
    viewerData.options.defaultPageIndex = 0
  }
  appendViewerContainer() 
  appendViewerPanel()
  viewerData.imgList.forEach((imgUrl, index) => {
    appendSingleViewer(imgUrl, index)
  })
  handleDefaultPage()
  appendRestDoms()
}

const userOrientationListener = () => {
  const newOrientation = orit.phoneOrientation()
  if(newOrientation !== orientation && viewerData) { // orientation changed
    // window.innerWidth, innerHeight变更会有延迟
    setTimeout(() => {
      showImgListViewer()
    }, 300)
  }
}

/**
 * Hide image
 */
export const hideImgListViewer = (notifyUser = true) => {
  if(notifyUser) {
    viewerData.options.onViewerHideListener()
  }
  scrollThrough(false)
  removeViewerContainer()
}

const handleDefaultPage = () => {
  currPage = viewerData.options.defaultPageIndex
  setTimeout(() => {
    new To(panelDom, "translateX", -currPage * window.innerWidth , 300, ease, () => {
      viewerData.options.onPageChanged(currPage)
    });
  }, 300)
}

const appendRestDoms = () => {
  viewerData.options.restDoms.forEach(additionDom => {
    // Element
    if(additionDom.nodeType === 1) {
      containerDom.appendChild(additionDom)
    } else {
      console.warn('Ignore invalid dom', additionDom)
    }
  })
}

const genImgId = index => `${VIEWER_SINGLE_IMAGE_ID}_${index}` 

const scrollToPage = (dom, targetPage, prevPage) => {
  // page changed, so we reset current page's translateX、scaleX、scaleY
  if(targetPage !== prevPage) {
    viewerData.options.onPageChanged(targetPage)
    if(dom.translateX !== 0)  new To(dom, "translateX", 0 , 300, ease);
    if(dom.translateY !== 0) new To(dom, "translateY", 0, 300, ease);
    if(dom.scaleX > 1) new To(dom, "scaleX", 1 , 300, ease);
    if(dom.scaleY > 1) new To(dom, "scaleY", 1 , 300, ease);
  }
  panelToX(targetPage)
}

const appendSingleViewer = (imgUrl, index) => {
  const imgContainerDom = document.createElement('div')
  imgContainerDom.setAttribute('class', VIEWER_SINGLE_IMAGE_CONTAINER)
  imgContainerDom.style.width = window.innerWidth + 'px'
  panelDom.appendChild(imgContainerDom)

  const loadingDom = document.createElement('div')
  loadingDom.setAttribute('class', 'pobi_mobile_viewer_loading')
  imgContainerDom.appendChild(loadingDom)

  const imgDom = document.createElement('img')
  imgDom.setAttribute('id', genImgId(index))
  imgDom.setAttribute('src', IMG_EMPTY)
  imgDom.style.width = window.innerWidth+'px'
  imgDom.style.height = window.innerWidth+'px'
  imgContainerDom.appendChild(imgDom)

  imgDom.addEventListener('click', imgClickListener)

  const resetImgDom = (w, h) => {
    let imgWidth = 0
    if(w > window.innerWidth) {
      imgWidth = window.innerWidth
    } else {
      imgWidth = w
    }
    imgDom.style.width = imgWidth + 'px'
    imgDom.style.height = 'auto'
  }
  const { 
    altImg, 
    pageDampingFactor,
    imgMoveFactor,
    pageThreshold,
    imgMinScale,
    imgMaxScale
  } = viewerData.options
  const pageCount = viewerData.imgList.length
  imageLoaded(imgUrl, (w, h) => {
    imgDom.src = imgUrl
    resetImgDom(w, h)
  }, error => {
    if(error) {
      if(altImg) {
        imageLoaded(altImg, (w, h) => {
          imgDom.src = altImg
          resetImgDom(w, h)
        }, error => {
          imgContainerDom.removeChild(loadingDom)
        })
      } else {
        imgContainerDom.removeChild(loadingDom)
      }
    } else {
      imgContainerDom.removeChild(loadingDom)
    }
  })
  const alloyFinger = imgAlloyFinger(imgDom, {
    pressMoveListener: (evt) => {
      const currPageTranslateStart = currPage * window.innerWidth
      const { scaleX, width, translateX } = imgDom
      const { deltaX, deltaY } = evt
      const panelTranslateX = pageDampingFactor * deltaX + panelDom.translateX
      const realWidth = scaleX * width
      const scaledWidth = Math.abs(realWidth - width) / 2
      const imgTranslateX = translateX + deltaX * imgMoveFactor
      if(Math.abs(deltaX) > Math.abs(deltaY)) {
        if(realWidth <= width) { // img shrinked
          panelDom.translateX = panelTranslateX 
        } else { // img enlarged
          if(Math.abs(imgTranslateX) - scaledWidth <= 0) {
            if(deltaX > 0) { // move to right
              if(Math.abs(panelDom.translateX) > currPageTranslateStart) {
                const panelReturnDis = panelTranslateX
                if(Math.abs(panelReturnDis) <  currPageTranslateStart) {
                  panelDom.translateX = -currPageTranslateStart
                } else {
                  panelDom.translateX = panelReturnDis
                }
              } else {
                imgDom.translateX = imgTranslateX
              }
            } else { // move to left
              if(Math.abs(panelDom.translateX) < currPageTranslateStart) {
                const panelReturnDis = panelTranslateX
                if(Math.abs(panelReturnDis) >  currPageTranslateStart) {
                  panelDom.translateX = -currPageTranslateStart
                } else {
                  panelDom.translateX = panelReturnDis
                }
              } else {
                imgDom.translateX = imgTranslateX
              }
            }
          } else {
            panelDom.translateX = panelTranslateX
          }
        }
      } else {
        imgDom.translateY += deltaY * imgMoveFactor
      }
    },
    touchEndListener: () => {
      const { translateX } = panelDom
      const scrollFactor = Math.abs(translateX) / window.innerWidth
      const page = Math.floor(scrollFactor)
      const factor = scrollFactor - page
      const fixedCurrPage = currPage
      if(page < currPage) { // to prev page
        if(factor <= (1-pageThreshold)) {
          currPage -= 1 
        }
      } else { // to next page
        if(factor >= pageThreshold) {
          if(currPage+1 !== pageCount && translateX < 0) {
            currPage += 1
          }
        }
      }
      scrollToPage(imgDom, currPage, fixedCurrPage)
    },
    singleTapListener: () => {
      hideImgListViewer()
    },
    rotationAble: false,
    imgMinScale,
    imgMaxScale,
  })
  alloyFinger.imgDom = imgDom
  alloyFingerList.push(alloyFinger)
}

const panelToX = (page) => {
  new To(panelDom, "translateX", -page*window.innerWidth , 500, ease);
}

const appendViewerContainer = () => {
  containerDom = document.getElementById(VIEWER_CONTAINER_ID)
  if (!containerDom) {
    containerDom = document.createElement('div')
    containerDom.setAttribute('id', VIEWER_CONTAINER_ID)
    containerDom.addEventListener('click', viewerContainerClickListener)
    document.body.appendChild(containerDom)
  }
}

const appendViewerPanel = () => {
  panelDom = document.getElementById(VIEWER_PANEL_ID)
  if (!panelDom) {
    panelDom = document.createElement('div')
    panelDom.setAttribute('id', VIEWER_PANEL_ID)
    panelDom.style.width = (window.innerWidth*viewerData.imgList.length) + 'px'
    panelDom.style.height = window.innerHeight + 'px'
    containerDom.appendChild(panelDom)
    Transform(panelDom)
    const proxyFinger = () => {
      const imgAF = alloyFingerList[currPage]
      if(imgAF && imgAF.imgDom.scaleX === viewerData.options.imgMinScale
        && imgAF.imgDom.translateX === 0) {
        return imgAF
      } else {
        return null
      }
    }
    let disableSingleTab = false
    pannelAlloyFinger = new AlloyFinger(panelDom, {
      pressMove: function(evt) {
        const imgAF = proxyFinger()
        if(imgAF) {
          disableSingleTab = true
          imgAF && imgAF.pressMoveListener(evt)
          evt.preventDefault()
        }
      },
      touchEnd: function(evt) {
        const imgAF = proxyFinger()
        if(imgAF) {
          imgAF && imgAF.touchEndListener(evt)
          evt.preventDefault()
          setTimeout(() => {
            disableSingleTab = false
          }, 300)
        }
        
      },
      pinch: function() {
        const imgAF = proxyFinger()
        if(imgAF) {
          disableSingleTab = true
        }
      },
      rotate: function() {
        const imgAF = proxyFinger()
        if(imgAF) {
          disableSingleTab = true
        }
      },
      doubleTap: function() {
        const imgAF = proxyFinger()
        if(imgAF) {
          disableSingleTab = true
          To.stopAll();
        }
      },
      singleTap: function() {
        const imgAF = proxyFinger()
        if(imgAF && !disableSingleTab) {
          hideImgListViewer()
        }
      },
      multipointEnd: function () {
        To.stopAll()
      },
      multipointStart: function () {
        To.stopAll()
      },
    })
  }
}

const imgClickListener = e => {
  e.stopPropagation()
}

const viewerContainerClickListener = e => {
  e.stopPropagation()
  hideImgListViewer()
}

const removeViewerContainer = () => {
  containerDom && document.body.removeChild(containerDom)
  orit.removeOrientationChangeListener(userOrientationListener)
  containerDom = null
  panelDom = null
  currPage = 0
  viewerData = null
  orientation = orit.PORTRAIT
  alloyFingerList.forEach(alloyFinger => {
    alloyFinger.destroy()
    alloyFinger.pressMoveListener = null
    alloyFinger.touchEndListener = null
    alloyFinger = null
  })
  alloyFingerList = []
  pannelAlloyFinger && pannelAlloyFinger.destroy()
  pannelAlloyFinger = null
}