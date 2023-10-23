const bancoDeDados = require('../bancodedados');
const fs = require('fs/promises');

let identificadorConsulta = 1;

const listaDeConsultas = async (req, res) => {
    const consultas = bancoDeDados.consultas;

    if(consultas.length === 0){
        return res.status(204).send();
    }

    return res.status(200).json(consultas);     
};

const cadastrarConsulta = async (req, res) => {
    const { tipoConsulta, valorConsulta, paciente } = req.body;

    if(!tipoConsulta) {
        return res.status(400).json({mensagem: 'O tipo de consulta deve ser informada'})
    }
    if(!valorConsulta) {
        return res.status(400).json({mensagem: 'O valor da consulta deve ser informado'})
    }
    if(!paciente.cpf) {
        return res.status(400).json({mensagem: 'Os dados dos clientes devem ser informados'})
    }

    if(isNaN(valorConsulta)){
        return res.status(400).json('O valor deve ser numérico')
    }

    const verificarConsultaNaoFinalizada = bancoDeDados.consultas.find((consulta) => {        
        const naoFinalizada = consulta.finalizada === false && paciente.cpf === consulta.paciente.cpf ;
            return naoFinalizada;
    })

    if(verificarConsultaNaoFinalizada){
            return res.status(400).json({
                "mensagem": "Já existe uma consulta em andamento com o cpf ou e-mail informado!"
            })
        }    

    const medicoEncontrado = bancoDeDados.consultorio.medicos.find((medico) => {
        
        if(medico.especialidade === tipoConsulta){        
            return medico;
        }
       
    });

    if(!medicoEncontrado){
        return res.status(404).json({mensagem: 'Especialidade não encontrada'})
    }

    const novaConsulta = {
        identificador: identificadorConsulta,
        tipoConsulta,
        identificadorMedico: medicoEncontrado.identificador,
        finalizada: false, 
        valorConsulta,
        paciente
    }

    bancoDeDados.consultas.push(novaConsulta);

    identificadorConsulta++;

    return res.status(204).send();
}
  
const atualizarPacienteConsulta = async (req, res) => {
    const { identificadorConsulta } = req.params;
    const { nome, cpf, dataNascimento, celular, email, senha } = req.body;

    if(!nome){
        return res.status(400).json({mensagem: 'O nome deve ser informado'})
    }
    if(!cpf){
        return res.status(400).json({mensagem: 'O cpf deve ser informada'})
    }
    if(!dataNascimento){
        return res.status(400).json({mensagem: 'A data de nascimento deve ser informada'})
    }
    if(!celular){
        return res.status(400).json({mensagem: 'O celular deve ser informada'})
    }
    if(!email){
        return res.status(400).json({mensagem: 'O e-mail deve ser informada'})
    }
    if(!senha){
        return res.status(400).json({mensagem: 'A senha deve ser informada'})
    }

    const identificador = bancoDeDados.consultas.find((id) => {
        return id.identificador === Number(identificadorConsulta);
    });

    if(!identificador){
        return res.status(400).json({mensagem: 'Identificador invalido'})
    }

    const paciente = bancoDeDados.consultas.find((consultas) => {
        return consultas.identificador === Number(identificadorConsulta);
    });

    if(!paciente){
        return res.status(404).json({mensagem: 'Paciente nao encontrado'})
    }
  
    bancoDeDados.consultas.forEach((consulta) => { 

        if(consulta.identificador !== Number(identificadorConsulta) && consulta.paciente.cpf === cpf){
            return res.status(400).json({ mensagem: 'Cpf ja consta na base'});
            }
        if(consulta.identificador !== Number(identificadorConsulta) && consulta.paciente.email === email){
            return res.status(400).json({ mensagem: 'O email ja consta na base'});
        }
        if(consulta.finalizada !== false && consulta.identificador === Number(identificadorConsulta)){
            
            return res.status(400).json({ mensagem: 'A consulta ja foi finalizada'});
        }
    });    

    paciente.nome = nome;
    paciente.cpf = cpf;
    paciente.dataNascimento = dataNascimento;
    paciente.celular = celular;
    paciente.email = email;
    paciente.senha = senha;         

    return res.status(204).send();
}

const deletarUmaConsulta = async (req, res) => {
    const { identificadorConsulta } = req.params;

    const identificador = bancoDeDados.consultas.find((consulta) => {
        return consulta.identificador === Number(identificadorConsulta);
    });

    if(!identificador){
        return res.status(400).json({mensagem: 'Identificador invalido'})
    }

    const verificarConsultaNaoFinalizada = bancoDeDados.consultas.find((consulta) => {        
        return consulta.finalizada === false;
    })

    if(!verificarConsultaNaoFinalizada){
            return res.status(400).json({
            "mensagem": "A consulta só pode ser removida se a mesma não estiver finalizada"
            })
        }

    bancoDeDados.consultas = bancoDeDados.consultas.filter((consulta) => {
        return consulta.identificador !== Number(identificadorConsulta);
    })    

    return res.status(204).send();
}

const finalizarUmaConsulta = async (req, res) => {
    const { identificadorConsulta, textoMedico } = req.body;

    if(!identificadorConsulta) {
        return res.status(400).json({mensagem: 'O tipo de consulta deve ser informada'})
    }
    if(!textoMedico) {
        return res.status(400).json({mensagem: 'O texto medico deve informado'})
    }

    const consulta = bancoDeDados.consultas.find((consulta) => {
        return consulta.identificador === Number(identificadorConsulta);
    });

    if(!consulta){
        return res.status(400).json({mensagem: 'Identificador invalido'})
    }

    if(consulta.finalizada){
            return res.status(400).json({
            "mensagem": "A consulta ja esta finalizada"
            })
    }
    consulta.finalizada = true;

    if(textoMedico.length < 0 || textoMedico.length > 200 ){
        return res.status(400).json({
                "mensagem": "O tamanho do textoMedico não está dentro do esperado"})
    }

    let identificador = 1;

    const laudo = {
        identificador,
        identificadorConsulta: consulta.identificador,
        identificadorMedico: consulta.identificadorMedico,
        textoMedico: textoMedico,
        paciente: consulta.paciente
      }

    consulta.identificadorLaudo = laudo.identificador;      
    
    bancoDeDados.consultasFinalizadas.push(consulta);  
    bancoDeDados.laudos.push(laudo);

    identificador++;

    return res.status(204).send();

}

const listaDeConsultasFinalizadas = async (req, res) => {
    const consultasFinalizadas = bancoDeDados.consultasFinalizadas;

    if(consultasFinalizadas.length === 0){
        return res.status(204).send();
    }

    return res.status(200).json(consultasFinalizadas);     
};

const listagemDeLaudo = async (req, res) => {
    const { identificador_consulta, senha } = req.query;
    const consultasFinalizadas = bancoDeDados.consultasFinalizadas;

    if(!identificador_consulta){
        return res.status(400).json({
            "mensagem": "O ID nao foi informado!"
          });
    }
    if(!senha){
        return res.status(400).json({
            "mensagem": "A Senha nao foi informada!"
          });
    }

    consultasFinalizadas.forEach((consulta) => { 

        if(consulta.identificador !== Number(identificador_consulta)){
            return res.status(400).json({mensagem: 'Identificador invalido'});
            }
        if(consulta.paciente.senha !== senha){
            return res.status(400).json({mensagem: 'Senha invalida'});
        }
        if(consulta.identificadorLaudo !== Number(identificador_consulta)){
            return res.status(400).json({mensagem: 'Consulta médica não encontrada!'});
        }
    });

    const consultaLaudo = bancoDeDados.laudos.filter((elemento) => {
       
       return elemento.identificador === Number(identificador_consulta);
    }) 

    return res.status(200).json(consultaLaudo);
}

const listaDeConsultaMedico = async (req, res) => {
    const { identificador_medico } = req.query;

    if(!identificador_medico){
        return res.status(400).json({
            "mensagem": "O ID nao foi informado!"
          });
    }

    const consultasDeUmMedico = bancoDeDados.consultasFinalizadas.filter((medico) => {

        if(medico.identificadorMedico !== Number(identificador_medico)){
            return res.status(400).json({mensagem: 'O médico informado não existe na base!'});
            }

       return medico.identificadorMedico === Number(identificador_medico);
    }) 

    return res.status(200).json(consultasDeUmMedico);
};

module.exports = {
    listaDeConsultas,
    cadastrarConsulta,
    atualizarPacienteConsulta,
    deletarUmaConsulta,
    finalizarUmaConsulta,
    listaDeConsultasFinalizadas,
    listagemDeLaudo,
    listaDeConsultaMedico
}

