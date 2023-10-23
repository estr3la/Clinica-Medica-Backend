const validarSenhas = (req, res, next) => {
    const { cnes_consultorio, senha_consultorio} = req.query;
    
    if(!cnes_consultorio){
        return res.status(400).json({
            "mensagem": "Cnes nao foi informada!"
          });
    };
    if(!senha_consultorio){
        return res.status(400).json({
            "mensagem": "A Senha nao foi informada!"
          });
    };
    if(cnes_consultorio !== '1001' || senha_consultorio !== 'CubosHealth@2022'){
        return res.status(401).json({
            "mensagem": "Cnes ou senha inválidos!"
          });
    };      
    next();
}
module.exports = {
    validarSenhas
}


