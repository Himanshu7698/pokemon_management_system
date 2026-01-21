import HttpService from "./interceptors";

export const PokemonListApi = async ({ queryKey }: any) => {
    const [_key, search] = queryKey;

    return HttpService.get(
        `/list?search=${search || ""}`
    );
};

export const createPockemonApi = async (body: FormData) => HttpService.post("/pokemon-with-ability", body)

