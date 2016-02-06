module goldman {
	export class HookManager extends egret.Sprite {
		private hook:Hook;

		private BASE_ROTATION_MAX:number = 60;//钩子默认旋转角度
		private LINE_HEIGHT_DEFAULT:number = 20;//绳子默认长度
		private GO_V_DEFAULT:number = 8;//钩子默认出击速度
		private BACK_V_DEFAULT:number = 13;//钩子默认缩回速度

		private direction:string;//当前方向
		private lineHeight:number;//绳子当前长度
		private goV:number;//钩子当前出击速度
		private backV:number;//钩子当前缩回速度

		private isGo:boolean = false;//钩子是否在抓取
		public isBack:boolean = false;//钩子是否在收回

		public static HOOK_MANAGER_EVENT:string = 'HOOK_MANAGER_EVENT';

		public static GO_COMPLETE_EVENT:string = 'GO_COMPLETE_EVENT';
		public static UPDATE_HOOK_POSITION_EVENT:string = 'UPDATE_HOOK_POSITION_EVENT';

		public constructor() {
			super();
			this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
		}

		private onAddToStage(e:egret.Event):void {
			this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
			this.createHook();
			this.lineHeight = this.LINE_HEIGHT_DEFAULT;
			this.hook.redrawHook(this.LINE_HEIGHT_DEFAULT);
			this.startRotate();
		}

		private createHook():void {
			this.hook = new Hook();
			this.addChild(this.hook);

			this.goV = this.GO_V_DEFAULT;
			this.backV = this.BACK_V_DEFAULT;
		}

		public onUpdateEnterFrame():void {
			this.onUpdateRotation();
			if (this.isGo) {
				this.onUpdateGo();
			}
		}

		public startRotate():void {
			this.direction = "left";
		}

		private onUpdateRotation():void {
			if (this.direction == "left") {
				this.hook.rotation+=1.5;
			} else if (this.direction == "right") {
				this.hook.rotation-=1.5;
			}
			if (this.direction != "stop") {
				if (this.hook.rotation < -this.BASE_ROTATION_MAX) {
					this.direction = "left";
				} else if (this.hook.rotation > this.BASE_ROTATION_MAX) {
					this.direction = "right";
				}
			}
		}

		public startGo():void {
			this.isGo = true;
			this.direction = "stop";
		}

		private onUpdateGo():void {
			var vHeight = this.goV;
			if (this.isBack) {
				vHeight = -this.backV;
			}
			this.lineHeight += vHeight;
			this.hook.redrawHook(this.lineHeight);

			this.dispatchEventWith(HookManager.HOOK_MANAGER_EVENT, false, {
				type: HookManager.UPDATE_HOOK_POSITION_EVENT,
				hook: this.hook,
				hookBmp: this.hook.hookBmp
			});

			if (this.lineHeight < this.LINE_HEIGHT_DEFAULT) {
				this.goComplete();
			}

			//判断是否出界
			if (!this.isBack) {
				var hookGlobalPoint = this.hook.localToGlobal(this.hook.hookBmp.x, this.hook.hookBmp.y);
				if (hookGlobalPoint.x < 0 || hookGlobalPoint.x > GameContainer.thisW || hookGlobalPoint.y > GameContainer.thisH) {//各种边缘出界
					this.isBack = true;
					this.backV = this.BACK_V_DEFAULT;
				}
			}
		}

		public hitObject(backV:number):void {
			this.isBack = true;
			this.backV = backV;
			//this.hook.setHookGrabStyle(true);
		}

		public goComplete():void {
			this.hook.setBackHookType();
			this.lineHeight = this.LINE_HEIGHT_DEFAULT;
			this.hook.redrawHook(this.lineHeight);
			this.isGo = false;
			this.isBack = false;
			this.startRotate();
			this.dispatchEventWith(HookManager.HOOK_MANAGER_EVENT, false, {type: HookManager.GO_COMPLETE_EVENT});
		}

		public setBackHookType(typeStr:string):void {
			console.log("catchObj.type: " + typeStr);
			this.hook.setBackHookType(typeStr);
		}
	}
}