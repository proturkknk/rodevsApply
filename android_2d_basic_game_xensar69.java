// GAME CLASS

package com.emsar.faxminigames;

import android.content.Context;
import android.graphics.Canvas;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

import androidx.annotation.NonNull;

public class Game extends SurfaceView implements SurfaceHolder.Callback {
    private final Player player;
    private final Joystick joystick;
    private final Square square;
    private GameLoop gameLoop;
    private Context context;

    public Game(Context context){
        super(context);

        this.context = context;
        SurfaceHolder holder = getHolder();
        holder.addCallback(this);

        player = new Player(getContext(), 500, 500, 30);
        joystick = new Joystick(getContext(), 235, 860, 80, 150);
        square = new Square(getContext(), 800, 300, 1400, 750);

        gameLoop = new GameLoop(this, holder);
        setFocusable(true);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        switch (event.getAction()){
            case MotionEvent.ACTION_DOWN:
                if(joystick.isPressed(event.getX(), event.getY())){
                    joystick.setPress(true);
                }
                return true;

            case MotionEvent.ACTION_MOVE:
                if(joystick.getPress()){
                    joystick.move(event.getX(), event.getY());
                }
                return true;

            case MotionEvent.ACTION_UP:
                joystick.setPress(false);
                joystick.resetCircle();
                return true;
        }

        return super.onTouchEvent(event);
    }

    @Override
    public void surfaceCreated(@NonNull SurfaceHolder surfaceHolder) {
        gameLoop.startLoop();
    }

    @Override
    public void surfaceChanged(@NonNull SurfaceHolder surfaceHolder, int i, int i1, int i2) {

    }

    @Override
    public void surfaceDestroyed(@NonNull SurfaceHolder surfaceHolder) {

    }

    @Override
    public void draw(Canvas canvas) {
        try{
            super.draw(canvas);
            player.draw(canvas);
            joystick.draw(canvas);
            square.draw(canvas);
        }catch(Exception e){

        }

    }

    public void Update(){
        joystick.Update();
        player.Update(joystick);
        square.Update();
    }
}

//PLAYER CLASS

package com.emsar.faxminigames;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;

import androidx.core.content.ContextCompat;

public class Player {
    private double xPos, yPos, Radius;
    private Paint paint;
    double MAX_SPEED = 400/60;

    public Player(Context context, double xPos, double yPos, double Radius){
        this.xPos = xPos;
        this.yPos = yPos;
        this.Radius = Radius;

        paint = new Paint();
        paint.setColor(ContextCompat.getColor(context, R.color.white));

    }

    public void draw(Canvas canvas){
        canvas.drawCircle((float)xPos, (float)yPos, (float)Radius, paint);
    }

    public void Update(Joystick joystick){
        this.xPos += joystick.getActx() * MAX_SPEED;
        this.yPos += joystick.getActy() * MAX_SPEED;
    }
}

//JOYSTICK CLASS

package com.emsar.faxminigames;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;

import androidx.core.content.ContextCompat;

public class Joystick {
    final double xpos, ypos, innerRadius, outRadius;
    double inx, iny, actx, acty;
    final Paint bigPaint, smallPaint;
    boolean pressing = false;

    public Joystick(Context context, double xpos, double ypos, double innerRadius, double outRadius){
        this.xpos = xpos;
        this.inx = xpos;
        this.ypos = ypos;
        this.iny = ypos;
        this.innerRadius = innerRadius;
        this.outRadius = outRadius;

        Paint smallPaint = new Paint();
        smallPaint.setColor(ContextCompat.getColor(context, R.color.white));

        Paint bigPaint = new Paint();
        bigPaint.setColor(ContextCompat.getColor(context, R.color.gray));

        this.smallPaint = smallPaint;
        this.bigPaint = bigPaint;
    }

    public void setPress(boolean toggle){
        this.pressing = toggle;
    }

    public Boolean getPress(){
        return this.pressing;
    }

    public void resetCircle(){
        this.inx = xpos;
        this.iny = ypos;
        this.acty = 0;
        this.actx = 0;
    }

    public boolean isPressed(double x, double y){
        double sqr = Math.sqrt(
                Math.pow(xpos - x, 2) + Math.pow(ypos - y, 2)
        );
        return sqr < this.outRadius;
    }

    public void move(double xTouch, double yTouch){
        double deltaX = xTouch - this.xpos;
        double deltaY = yTouch - this.ypos;
        double sqr = Math.sqrt(Math.pow(deltaX,2) + Math.pow(deltaY, 2));
        if(sqr < this.outRadius){
            this.actx = deltaX/this.outRadius;
            this.acty = deltaY/this.outRadius;
        }else{
            this.actx = deltaX/sqr;
            this.acty = deltaY/sqr;
        }
        this.inx = this.xpos + this.actx * this.outRadius;
        this.iny = this.ypos + this.acty * this.outRadius;
    }

    public double getActx(){
        return this.actx;
    }

    public double getActy(){
        return this.acty;
    }

    public void draw(Canvas canvas){
        canvas.drawCircle((float)xpos, (float)ypos, (float)outRadius, bigPaint);
        canvas.drawCircle((float)inx, (float)iny, (float)innerRadius, smallPaint);
    }

    public void Update(){

    }
}
