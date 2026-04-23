import { createBrowserRouter, Navigate } from 'react-router-dom'
import { App } from './App'
import { BasicsPage } from '../pages/basics/page'
import { TextPage } from '../pages/text/page'
import { CodePage } from '../pages/code/page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/basics" replace /> },
      { path: 'basics', element: <BasicsPage /> },
      { path: 'text', element: <TextPage /> },
      { path: 'code', element: <CodePage /> },
      {
        path: '*',
        element: (
          <p className="text-sm text-zinc-500">
            페이지가 없습니다. <a href="/basics" className="underline">/basics</a>로 이동하세요.
          </p>
        ),
      },
    ],
  },
])
