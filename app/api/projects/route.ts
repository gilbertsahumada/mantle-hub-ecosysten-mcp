import { NextRequest, NextResponse } from "next/server";
import { QdranSimpleService } from "@/lib/qdrant-simple";
import { ProjectService } from "@/lib/services/project.service";

export async function POST(request: NextRequest) { 
    try {
        const { projectId, filePath } = await request.json();
        
        if (!projectId || !filePath) {
            return NextResponse.json(
                { error: "projectId and filePath are required" },
                { status: 400 }
            );
        }

        const qdrantService = new QdranSimpleService();
        
        await qdrantService.processMarkdownFile(filePath, projectId);

        return NextResponse.json({ 
            message: "Document indexed successfully",
            projectId,
            filePath,
            collection: `project_${projectId}`
        }, { status: 200 });
    } catch (error) {
        console.error("Error processing project:", error);
        return NextResponse.json(
            { error: `Failed to process project: ${error}` },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        
        const projectService = new ProjectService();
        
        let projects;
        if (category && category !== 'all') {
            projects = await projectService.getProjectsByCategory(category);
        } else {
            projects = await projectService.getAllProjects();
        }

        return NextResponse.json({ 
            projects,
            total: projects.length 
        }, { status: 200 });
        
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json(
            { error: `Failed to fetch projects: ${error}` },
            { status: 500 }
        );
    }
}