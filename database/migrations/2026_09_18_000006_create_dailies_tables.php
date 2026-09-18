<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dailies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title', 160);
            $table->text('notes')->nullable();
            $table->string('difficulty')->default('normal');
            $table->string('frequency')->default('daily');
            $table->json('days_of_week')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->date('starts_on')->nullable();
            $table->date('ends_on')->nullable();
            $table->timestamps();
        });

        Schema::create('daily_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('completed_on')->index();
            $table->timestamp('completed_at');
            $table->timestamps();
            $table->unique(['daily_id', 'completed_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_completions');
        Schema::dropIfExists('dailies');
    }
};
