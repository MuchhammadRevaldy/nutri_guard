import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import modelUrl from '@/images/3dlogo-nutri.glb';

// Palet warna NutriGuard: emerald / teal / cyan
const BRAND_COLORS = [
    new THREE.Color('#10b981'), // emerald-500
    new THREE.Color('#14b8a6'), // teal-500
    new THREE.Color('#06b6d4'), // cyan-500
    new THREE.Color('#34d399'), // emerald-400
    new THREE.Color('#2dd4bf'), // teal-400
];

function Model() {
    const { scene } = useGLTF(modelUrl);
    const ref = useRef();
    const colorIndexRef = useRef(0);

    // Terapkan warna brand ke semua material dalam model
    useEffect(() => {
        let meshIndex = 0;
        scene.traverse((child) => {
            if (child.isMesh) {
                const color = BRAND_COLORS[meshIndex % BRAND_COLORS.length];
                // Buat material baru agar tidak mutate original
                child.material = new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.4,
                    roughness: 0.2,
                    envMapIntensity: 1.2,
                });
                child.castShadow = true;
                child.receiveShadow = true;
                meshIndex++;
            }
        });
    }, [scene]);

    useFrame((state) => {
        if (ref.current) {
            // Putar di sumbu Y saja, pertahankan X (berdiri tegak menghadap kamera)
            ref.current.rotation.y = state.clock.getElapsedTime() * 0.35;
            ref.current.rotation.x = -Math.PI / 2; // tegak menghadap depan
        }
    });

    return (
        <primitive
            ref={ref}
            object={scene}
            scale={1.8}
            position={[0, -0.2, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
        />
    );
}

function FallbackSphere() {
    return (
        <mesh>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#10b981" metalness={0.5} roughness={0.2} />
        </mesh>
    );
}

export default function Hero3DModel() {
    return (
        <div className="relative w-full h-full" style={{ minHeight: '460px' }}>
            {/* Glow layers sesuai tema */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(16,185,129,0.18) 0%, rgba(6,182,212,0.08) 60%, transparent 100%)',
                    borderRadius: '50%',
                }}
            />
            <div
                className="absolute pointer-events-none"
                style={{
                    top: '10%', left: '15%', right: '15%', bottom: '10%',
                    background: 'radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.12) 0%, transparent 70%)',
                    filter: 'blur(24px)',
                }}
            />

            <Canvas
                camera={{ position: [0, 0, 7], fov: 45 }}
                style={{ width: '100%', height: '100%', minHeight: '460px' }}
                gl={{ antialias: true, alpha: true }}
                shadows
            >
                {/* Pencahayaan tema emerald/teal */}
                <ambientLight intensity={0.4} />

                {/* Cahaya utama — hangat hijau emerald */}
                <directionalLight
                    position={[4, 6, 5]}
                    intensity={2.0}
                    color="#a7f3d0"
                    castShadow
                />
                {/* Rim light biru-cyan dari belakang kiri */}
                <directionalLight
                    position={[-5, 2, -4]}
                    intensity={0.8}
                    color="#67e8f9"
                />
                {/* Fill light bawah */}
                <pointLight position={[0, -3, 2]} intensity={0.5} color="#34d399" />
                {/* Accent glow teal */}
                <pointLight position={[3, 1, 3]} intensity={1.0} color="#2dd4bf" />
                {/* Accent glow emerald kiri */}
                <pointLight position={[-3, 3, 1]} intensity={0.7} color="#10b981" />

                <Suspense fallback={<FallbackSphere />}>
                    <Float
                        speed={1.8}
                        rotationIntensity={0.2}
                        floatIntensity={0.6}
                    >
                        <Model />
                    </Float>

                    <ContactShadows
                        position={[0, -2.5, 0]}
                        opacity={0.35}
                        scale={7}
                        blur={2.5}
                        color="#10b981"
                    />

                    {/* Environment untuk refleksi natural */}
                    <Environment preset="studio" />
                </Suspense>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.7}
                    autoRotate={false}
                />
            </Canvas>
        </div>
    );
}
