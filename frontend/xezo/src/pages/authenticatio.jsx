import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import Snackbar from '@mui/material/Snackbar';
import { AuthContext } from '../contexts/AuthContext';




// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Authentication() {


    const[username , setUsername]= React.useState();  // username
    const[formState , setFormState] = React.useState(0); // formState (check whether it is in sign-up or in sig-in )
    const[password , setPassword] = React.useState(); //password 
    const[name , setName] = React.useState(); // name
    const[message , setMessage] = React.useState();
    const[error , setError] = React.useState("ads");


   const {handleRegister , handleLogin} = React.useContext(AuthContext);
const[open , setOpen] = React.useState(false);

  let handleAuth = async() => {
    try{
        if(formState == 0){
          let result = await handleLogin(username , password );
          setMessage(result);
          setOpen(true);
        } 

        if(formState == 1){
            let result = await handleRegister(name , username , password);
            console.log(result);
            setMessage(result)
            setOpen(true);
            setError("");
            setFormState(0);
            setPassword("");
        }

    }catch(err){
        console.log(err);
        let message = (err.response.data.message)
        setError(message);
        console.log(err);
    }
  }
    return (
        <div className="row">
        
        <div className="col-7">
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: 'url(..public/ChatGPT Image Jan 28, 2026, 10_17_55 PM.png)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>

<div>
                        <Button variant={formState == 0 ? "contained" : ""} onClick = {() => {setFormState(0)} }>
                            Sign in
                        </Button>   /    
                        <Button variant={formState == 1 ? "contained" : " "} onClick={() => {setFormState(1)}}>Sign Up

                        </Button>
  </div>                     
                        <Box component="form" noValidate sx={{ mt: 1 }}>
                     
                          {formState == 1 ? 
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="full name"
                                label="Full Name"
                                name="fullname"
                                value={name}
                              onChange ={(e) => setName(e.target.value)}
                                autoFocus
                                
                            />:<></>}

                            <TextField 
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                               onChange = {(e) => setUsername(e.target.value)}
                                autoFocus
                              
                            /> 

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="password"
                                label="password"
                                name="password"
                                value={password}
                                 type="password"
                              onChange = {(e) => setPassword(e.target.value)}
                                autoFocus
                                
                            />
                           
                            
           <p style={{color:"red"}}> {error} </p>
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                               onClick={handleAuth}
                                
                            > {formState == 0 ? "Sign In" : "Register"}
                            </Button>

                        </Box>
                    </Box>
                </Grid>
            </Grid>

           
           {/* <Snackbar> notification bar at bottom */}
           <Snackbar
            open={open}
            autoHideDuration={4000}
            message={message}
               onClose={() => setOpen(false)}

           />


        </ThemeProvider>
        </div>
        <div className="col">
            <img style={{width:"50%" , marginTop:"30px"}} src="/Video call-cuate.svg"/> <b style={{fontSize:"30px"}}> " Alone we can do</b><br></br>
             <img style={{width:"50%" , marginTop:"20px" , marginRight:"1px"}} src="/Group video-pana (1).svg"/><b style={{fontSize:"30px"}}>little; together we can </b>
              <img style={{width:"50%"}} src="/Group video-rafiki.svg"/><b style={{fontSize:"30px"}}>achieve a lot”</b>
        </div>
        </div>
    );
}
