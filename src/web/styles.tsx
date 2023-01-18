import Color from 'color'
import { createThemeStore, DecoRockProvider, type DefaultTheme } from 'decorock'
import { Component, createEffect, JSX } from 'solid-js'

import './global.css'
import { config } from './lib/config'

const themes: Record<'dark' | 'light', DefaultTheme> = {
  dark: {
    name: 'dark',
    colors: {
      primary: Color('#ddd'),
      secondary: Color('#333'),
    },
  },
  light: {
    name: 'light',
    colors: {
      primary: Color('#333'),
      secondary: Color('#ddd'),
    },
  },
}

export const [theme, setTheme] = createThemeStore({ ...themes[config['system/theme']] })

const GlobalStyles: Component = () => {
  return (
    <style
      // eslint-disable-next-line solid/no-innerhtml
      innerHTML={`
        body {
          background-color: ${theme.colors.secondary};
          color: ${theme.colors.primary};
          min-height: 100vh;
        }
      `}
    />
  )
}

export const ThemeProvider: Component<{ children: JSX.Element }> = (props) => {
  createEffect(() => {
    setTheme({ ...themes[config['system/theme']] })
  })

  return (
    <DecoRockProvider theme={theme} build={(p) => (p?.string ? p : p)}>
      <GlobalStyles />
      {props.children}
    </DecoRockProvider>
  )
}

declare module 'decorock' {
  export interface DefaultTheme {
    name: string
    colors: {
      primary: Color
      secondary: Color
    }
  }
}
