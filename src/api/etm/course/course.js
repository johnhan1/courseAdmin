// 统一的请求处理函数
const request = async (url, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json'
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Request failed:', error)
    throw error
  }
}

// 保存课程接口
export const saveCourse = (data) => {
  return request('http://localhost:8080/newapi/etm.course.Index/save', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
