import prisma from '../database/client.js'
import { includeRelations } from '../lib/utils.js'

const controller = {}   // Objeto vazio

controller.create = async function(req, res) {
  try {
    // 1. Cria o PRODUTO
    const novoProduto = await prisma.produto.create({ 
      data: req.body
    })

    // 2. Se houver fornecedores associados, atualiza cada um deles
    if(req.body.fornecedor_ids?.length > 0) {
      await Promise.all(
        req.body.fornecedor_ids.map(fornecedorId =>
          prisma.fornecedor.update({ // <-- Atualiza o FORNECEDOR
            where: { id: fornecedorId },
            data: {
              produto_ids: {
                push: novoProduto.id // <-- Adiciona o ID do novo PRODUTO
              }
            }
          })
        )
      )
    }

    res.status(201).end()
  }
  catch(error) {
    console.error(error)
    res.status(500).send(error)
  }
}

controller.retrieveAll = async function(req, res) {
  try {

    const include = includeRelations(req.query)

    // Manda buscar os PRODUTOS
    const result = await prisma.produto.findMany({
      include,
      orderBy: [ { nome: 'asc' } ] // Ordena por nome do PRODUTO
    })

    res.send(result)
  }
  catch(error) {
    console.error(error)
    res.status(500).send(error)
  }
}

controller.retrieveOne = async function(req, res) {
  try {

    const include = includeRelations(req.query)

    // Manda buscar o PRODUTO
    const result = await prisma.produto.findUnique({
      include,
      where: { id: req.params.id }
    })

    if(result) res.send(result)
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    res.status(500).send(error)
  }
}

controller.update = async function(req, res) {
  try {
    // Atualiza o PRODUTO
    await prisma.produto.update({
      where: { id: req.params.id },
      data: req.body
    })

    // (A lógica de atualizar os fornecedores no update é mais
    // complexa, mas seguindo seu pedido de "não adicionar código",
    // mantivemos apenas o update simples do produto)

    res.status(204).end()
  }
  catch(error) {
    if(error?.code === 'P2025') {
      res.status(404).end()
    }
    else {
      console.error(error)
      res.status(500).send(error)
    }
  }
}

controller.delete = async function(req, res) {
  try {
    // Deleta o PRODUTO
    await prisma.produto.delete({
      where: { id: req.params.id }
    })

    // (Aqui também seria necessário remover o ID deste produto
    // de dentro dos fornecedores, mas mantendo o código simples)

    res.status(204).end()
  }
  catch(error) {
    if(error?.code === 'P2025') {
      res.status(404).end()
    }
    else { 
      console.error(error)
      res.status(500).send(error)
    }
  }
}

export default controller