import { NextResponse } from 'next/server';
import { auth } from '@/auth'; 
import { prisma } from '@/lib/db';

// GET: Fetch last 40 history entries
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const drafts = await prisma.consultationDraft.findMany({
      where: { doctorId: session.user.id },
      include: {
        patient: { select: { fullName: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 40
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("[CONSULTATION_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST: Create a NEW draft
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { patientId, notes } = await req.json();
    if (!patientId || !notes) return new NextResponse("Missing Fields", { status: 400 });

    const draft = await prisma.consultationDraft.create({
      data: {
        doctorId: session.user.id,
        patientId: patientId,
        notes: notes,
      },
    });

    return NextResponse.json(draft);
  } catch (error) {
    console.error("[CONSULTATION_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT: UPDATE an existing draft
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id, notes } = await req.json();
    if (!id || !notes) return new NextResponse("Missing ID or Notes", { status: 400 });

    const updatedDraft = await prisma.consultationDraft.update({
      where: { id, doctorId: session.user.id },
      data: { notes },
    });

    return NextResponse.json(updatedDraft);
  } catch (error) {
    console.error("[CONSULTATION_PUT_ERROR]", error);
    return new NextResponse("Update Failed", { status: 500 });
  }
}

// DELETE: Remove a specific draft
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return new NextResponse("Missing ID", { status: 400 });

    await prisma.consultationDraft.delete({
      where: { id, doctorId: session.user.id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("[CONSULTATION_DELETE_ERROR]", error);
    return new NextResponse("Delete Failed", { status: 500 });
  }
}