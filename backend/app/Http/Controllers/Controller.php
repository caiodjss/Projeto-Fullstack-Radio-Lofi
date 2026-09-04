<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[
    OA\Info(
        version: "1.0.0",
        title: "Lofi Radio API",
        description: "Documentação da API da Rádio Lo-Fi"
    ),
    OA\Server(
        url: "http://localhost:8000",
        description: "Servidor Local"
    ),
    OA\Get(
        path: "/api/health",
        summary: "Verifica a saúde da API",
        tags: ["Health"],
        responses: [
            new OA\Response(
                response: 200,
                description: "API online"
            )
        ]
    )
]
abstract class Controller
{
    //
}