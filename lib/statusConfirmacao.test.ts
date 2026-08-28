import { mapStatusConfirmacao } from "./statusConfirmacao";

describe("mapStatusConfirmacao", () => {
  it("mapeia CONFIRMADO para confirmada", () => {
    expect(mapStatusConfirmacao("CONFIRMADO")).toBe("confirmada");
  });

  it("mapeia PENDENTE para pendente", () => {
    expect(mapStatusConfirmacao("PENDENTE")).toBe("pendente");
  });

  it("mapeia ENVIADO para pendente", () => {
    expect(mapStatusConfirmacao("ENVIADO")).toBe("pendente");
  });

  it("mapeia DISPENSADO para pendente", () => {
    expect(mapStatusConfirmacao("DISPENSADO")).toBe("pendente");
  });

  it("mapeia EXPIRADO para nao-recebe", () => {
    expect(mapStatusConfirmacao("EXPIRADO")).toBe("nao-recebe");
  });

  it("mapeia FALHOU para nao-recebe", () => {
    expect(mapStatusConfirmacao("FALHOU")).toBe("nao-recebe");
  });

  it("mapeia REAGENDADO para null, por não ter indicador definido nesta feature", () => {
    expect(mapStatusConfirmacao("REAGENDADO")).toBeNull();
  });

  it("devolve null quando o status é undefined (campo ausente na rota)", () => {
    expect(mapStatusConfirmacao(undefined)).toBeNull();
  });

  it("devolve null quando o status é null", () => {
    expect(mapStatusConfirmacao(null)).toBeNull();
  });

  it("devolve null para status desconhecido, sem cair em pendente", () => {
    expect(mapStatusConfirmacao("RECUSADO")).toBeNull();
  });
});
