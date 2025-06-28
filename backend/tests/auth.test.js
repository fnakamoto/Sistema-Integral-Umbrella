const request = require("supertest");
const app = require("../server"); // ajuste se necessário

describe("Auth endpoints", () => {
  it("Deve retornar 400 ao enviar dados inválidos no login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "invalido",
      senha: "",
    });
    expect(res.statusCode).toEqual(400);
  });

  it("Deve permitir cadastro e login", async () => {
    const usuario = {
      nome: "Teste",
      email: "teste@example.com",
      senha: "123456",
    };

    // Cadastro
    const resCadastro = await request(app).post("/api/auth/register").send(usuario);
    expect([201,409]).toContain(resCadastro.statusCode); // 201 criado ou 409 já existe

    // Login
    const resLogin = await request(app).post("/api/auth/login").send({
      email: usuario.email,
      senha: usuario.senha,
    });
    expect(resLogin.statusCode).toEqual(200);
    expect(resLogin.body).toHaveProperty("token");
  });
});
