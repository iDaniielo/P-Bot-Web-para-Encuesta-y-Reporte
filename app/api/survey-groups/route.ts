import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET - List all survey groups
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: groups, error } = await supabase
      .from('survey_groups')
      .select(`
        *,
        surveys:surveys(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching survey groups:', error);
      return NextResponse.json(
        { error: 'Error al cargar los grupos', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ groups: groups || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// POST - Create a new survey group
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre del grupo es obligatorio' },
        { status: 400 }
      );
    }

    // Insert group
    const { data: group, error } = await supabase
      .from('survey_groups')
      .insert([
        {
          name: name.trim(),
          description: description?.trim() || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating survey group:', error);
      return NextResponse.json(
        { error: 'Error al crear el grupo', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al crear el grupo' },
      { status: 500 }
    );
  }
}

// PATCH - Update a survey group
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID del grupo es obligatorio' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;

    // Update group
    const { data: group, error } = await supabase
      .from('survey_groups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating survey group:', error);
      return NextResponse.json(
        { error: 'Error al actualizar el grupo', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al actualizar el grupo' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a survey group
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID del grupo es obligatorio' },
        { status: 400 }
      );
    }

    // Delete group (surveys will have their group_id set to null due to ON DELETE SET NULL)
    const { error } = await supabase
      .from('survey_groups')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting survey group:', error);
      return NextResponse.json(
        { error: 'Error al eliminar el grupo', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al eliminar el grupo' },
      { status: 500 }
    );
  }
}
