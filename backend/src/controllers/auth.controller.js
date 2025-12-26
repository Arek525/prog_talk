const authService = require('../services/auth.service');

async function register(req, res){
    try{
        const {email, password, country} = req.body;

        const user = await authService.register({
            email,
            password,
            country
        });

        res.status(201).json({
            message: 'Registration successful, await approval',
            userId: user._id
        });
    } catch(err){
        res.status(400).json({error: err.message});
    }
}

async function login(req, res){
    try{
        const {email, password} = req.body;

        const result = await authService.login({email, password});
        if(!result){
            return res.status(401).json({error: 'Invalid credentials'});
        }

        const {user, token} = result;

        res.cookie('access_token', token, {
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch(err){
        res.status(403).json({error: err.message})
    }
}

function logout(req, res){
    res.clearCookie('access_token');
    res.json({message: 'Logged out'});
}

function me(req, res){
    res.json({
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status
    })
}

module.exports = {
  register,
  login,
  logout,
  me,
};
