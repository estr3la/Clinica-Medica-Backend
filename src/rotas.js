const express = require('express');
const { listaDeConsultas, cadastrarConsulta, atualizarPacienteConsulta, deletarUmaConsulta, finalizarUmaConsulta, listagemDeLaudo, listaDeConsultasFinalizadas, listaDeConsultaMedico } = require('./contoladores/consultas');
const { validarSenhas } = require('./intermediarios');

const rotas = express();

rotas.get('/consultas', validarSenhas, listaDeConsultas);
rotas.post('/consulta', cadastrarConsulta);
rotas.put('/consulta/:identificadorConsulta/paciente', atualizarPacienteConsulta);
rotas.delete('/consulta/:identificadorConsulta', deletarUmaConsulta);
rotas.post('/consulta/finalizar', finalizarUmaConsulta);
rotas.get('/consulta/laudo', listagemDeLaudo);
rotas.get('/consulta/finalizada', listaDeConsultasFinalizadas );
rotas.get('/consulta/medico', listaDeConsultaMedico);

module.exports = rotas;