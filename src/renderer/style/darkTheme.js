import {createMuiTheme} from '@material-ui/core'
import {dark as color} from './colors'

const style = createMuiTheme({
  overrides: {
    MuiDialog: {
      paper: {
        backgroundColor: color.background
      },
      root: {
        color: color.color
      }
    },
    MuiInput: {
      root: {
        color: color.color,
        '&$underline': {
          '&:before': {
            borderBottomColor: color.color
          },
          '&:after': {
            borderBottomColor: color.secondary
          },
          '&&&&:hover:before': {
            borderBottom: '1px solid ' + color.secondary
          }
        },
        width: "90px",
      },
    },
    MuiFormControl: {
      root:{
        display: 'block'
      }
    },
    MuiButton: {
      text: {
        color: color.color
      }
    },
    MuiInputLabel: {
      root: {
        color: color.color,
        "&$focused": {
          "&$focused": {
            "color": color.secondary
          }
        }
      },
    },
    MuiCheckbox: {
      root: {
        color: color.color,
        '&$checked': {
          '&$checked': {
            color: color.secondary,
          }
        },
      },
      checked: {}
    },
    MuiTypography: {
      h6: {
        color: color.color
      },
      body2: {
        color: color.color
      }
    },
    MuiTab: {
      root: {
        '&:hover': {
          color: color.secondary,
          opacity: 1,
        },
        '&$selected': {
          color: color.secondary
        },
        '&:focus': {
          color: color.secondary,
        },
      },
      labelContainer: {
        fontSize: 14
      }
    },
    MuiTabs: {
      root: {
        borderRadius: '20px',
      },
      indicator: {
        backgroundColor: color.secondary,
        borderRadius: '20px'
      }
    }
  },
  typography: {
    "fontFamily": 'Nunito',
    "fontSize": 18,
    "fontWeightLight": 300,
    "fontWeightRegular": 400,
    "fontWeightMedium": 500,
    useNextVariants: true
  },
});

export {style};